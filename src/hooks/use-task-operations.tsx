
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask } from './use-task-mapper';
import { format, parseISO, addMinutes } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { formDateTimeToISO, getLocalTimezone } from '@/utils/timezone';

export const useTaskOperations = (user: any) => {
  const [operationLoading, setOperationLoading] = useState(false);
  const { user: authUser } = useAuth();
  
  // Helper function to get the user's timezone
  const getUserTimezone = (): string => {
    // Get timezone from user metadata if available
    if (authUser?.timezone) {
      return authUser.timezone;
    }
    
    // Fallback to browser's timezone
    return getLocalTimezone();
  };

  // Helper function to properly format time with user's timezone for database
  const formatTimeForDB = (dateInput: string, timeString: string | null): string | null => {
    if (!timeString || !dateInput) return null;
    
    try {
      // Get user's timezone
      const userTimezone = getUserTimezone();
      console.log('Using timezone for time formatting:', userTimezone);
      
      // Convert date and time to ISO string with timezone
      return formDateTimeToISO(dateInput, timeString);
    } catch (err) {
      console.error('Error formatting time for DB:', err);
      return null;
    }
  };

  // Helper function to properly format date with user's timezone for database
  const formatDateForDB = (date: Date | string): string | null => {
    if (!date) return null;
    
    try {
      // Get user's timezone
      const userTimezone = getUserTimezone();
      console.log('Using timezone for date formatting:', userTimezone);
      
      // Convert to ISO string with timezone (use midnight as the time)
      return formDateTimeToISO(typeof date === 'string' ? date : format(date, 'yyyy-MM-dd'), null);
    } catch (err) {
      console.error('Error formatting date for DB:', err);
      return null;
    }
  };

  // Create a new task
  const createTask = async (taskData: Omit<TaskProps, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return null;
    }

    try {
      setOperationLoading(true);
      console.log('Creating task with data:', taskData); // Debug log
      
      // Format due date with timezone information
      const dueDate = taskData.dueDate ? formatDateForDB(taskData.dueDate) : null;
      console.log('Formatted due date:', dueDate);

      // Format start and end times properly with timezone information
      let startTime = null;
      let endTime = null;
      
      if (taskData.startTime && typeof taskData.dueDate === 'string') {
        console.log('Start time:', taskData.startTime);
        startTime = formatTimeForDB(taskData.dueDate, taskData.startTime);
        console.log('Formatted start time:', startTime);
        
        // If end time is not provided, add 30 minutes to start time
        if (!taskData.endTime && startTime) {
          // Parse the start time
          const startDateTime = new Date(startTime);
          
          // Add 30 minutes
          const endDateTime = addMinutes(startDateTime, 30);
          const endTimeIso = endDateTime.toISOString();
          
          endTime = endTimeIso;
          console.log('Generated end time:', endTime);
        } else if (taskData.endTime) {
          endTime = formatTimeForDB(taskData.dueDate, taskData.endTime);
          console.log('Formatted end time:', endTime);
        }
      }

      // Prepare the task data for database
      const taskDbData = {
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: dueDate,
        completed: taskData.completed || false,
        sync_source: 'app', // Added for Google Calendar integration
        start_time: startTime,
        end_time: endTime,
        is_all_day: taskData.isAllDay !== undefined ? taskData.isAllDay : true,
      };

      console.log('Task DB data being inserted:', taskDbData); // Debug log
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskDbData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task in database:', error);
        throw new Error(error.message);
      }

      // After creating the task, add an entry to task history table
      await recordTaskHistory(data.id, data.title, 'created', 'Task created');

      toast.success('Task created successfully');
      return mapDbTaskToTask(data);
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    } finally {
      setOperationLoading(false);
    }
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<TaskProps>) => {
    if (!user) {
      toast.error('You must be logged in to update tasks');
      return null;
    }

    try {
      setOperationLoading(true);
      console.log('Updating task:', id, 'with updates:', updates); // Debug log
      
      // Get the task before updating to record in history
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('title, due_date')
        .eq('id', id)
        .single();
      
      // Check if we're dealing with mock data (IDs from mock data are numeric strings)
      if (/^\d+$/.test(id)) {
        console.log('Updating mock task:', id);
        // For mock data, just return a successful result with the updated task
        const mockUpdatedTask = {
          id,
          title: updates.title || 'Mock Task',
          description: updates.description || '',
          priority: updates.priority || 'medium',
          dueDate: updates.dueDate || new Date(),
          completed: updates.completed !== undefined ? updates.completed : false,
          tags: updates.tags || [],
        };
        
        // Simulate a delay to make it feel more realistic
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return mockUpdatedTask;
      }
      
      // Convert to database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      
      // Format due date with timezone information
      if (updates.dueDate !== undefined) {
        dbUpdates.due_date = updates.dueDate ? formatDateForDB(updates.dueDate) : null;
        console.log('Formatted due date for update:', dbUpdates.due_date);
      }
      
      // Handle all-day flag
      if (updates.isAllDay !== undefined) {
        dbUpdates.is_all_day = updates.isAllDay;
        
        // If switching to all-day, clear time fields
        if (updates.isAllDay) {
          dbUpdates.start_time = null;
          dbUpdates.end_time = null;
        }
      }
      
      // Format start and end times properly with timezone information
      const dueDate = updates.dueDate || existingTask.due_date || null;
      
      if (updates.startTime !== undefined && dueDate) {
        const dueDateStr = typeof dueDate === 'string' ? dueDate.split('T')[0] : format(dueDate, 'yyyy-MM-dd');
        dbUpdates.start_time = updates.startTime ? formatTimeForDB(dueDateStr, updates.startTime) : null;
        console.log('Formatted start time for update:', dbUpdates.start_time);
        
        // Update is_all_day when setting a time
        if (updates.startTime && dbUpdates.is_all_day === undefined) {
          dbUpdates.is_all_day = false;
        }
      }
      
      if (updates.endTime !== undefined && dueDate) {
        const dueDateStr = typeof dueDate === 'string' ? dueDate.split('T')[0] : format(dueDate, 'yyyy-MM-dd');
        dbUpdates.end_time = updates.endTime ? formatTimeForDB(dueDateStr, updates.endTime) : null;
        console.log('Formatted end time for update:', dbUpdates.end_time);
        
        // Update is_all_day when setting a time
        if (updates.endTime && dbUpdates.is_all_day === undefined) {
          dbUpdates.is_all_day = false;
        }
      }
      
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      
      // Mark that this update came from the app
      dbUpdates.sync_source = 'app';
      dbUpdates.updated_at = new Date().toISOString();

      console.log('DB updates being sent:', dbUpdates); // Debug log
      
      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task in database:', error);
        throw new Error(error.message);
      }

      // Generate appropriate details for task history entry
      let details = 'Task updated';
      if (updates.completed !== undefined) {
        details = updates.completed ? 'Task marked as completed' : 'Task marked as incomplete';
      }

      // Record the update in task history table
      await recordTaskHistory(id, existingTask.title, updates.completed ? 'completed' : 'updated', details);

      const mappedTask = mapDbTaskToTask(data);
      console.log('Task updated successfully:', mappedTask); // Debug log
      toast.success('Task updated successfully');
      return mappedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    } finally {
      setOperationLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete tasks');
      return false;
    }

    try {
      setOperationLoading(true);
      console.log('Deleting task:', id); // Debug log
      
      // Get the task title before deleting to record in history
      const { data: task } = await supabase
        .from('tasks')
        .select('title, google_calendar_event_id, google_calendar_id')
        .eq('id', id)
        .maybeSingle();
        
      // Check if we're dealing with mock data (IDs from mock data are numeric strings)
      if (/^\d+$/.test(id)) {
        console.log('Deleting mock task:', id);
        // For mock data, just return a successful result
        
        // Simulate a delay to make it feel more realistic
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast.success('Task deleted successfully');
        return true;
      }
      
      // If this task has an associated Google Calendar event, try to delete it
      if (task?.google_calendar_event_id && task?.google_calendar_id) {
        try {
          // Get the Google Calendar integration
          const { data: integration } = await supabase
            .from('user_integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'google_calendar')
            .eq('connected', true)
            .maybeSingle();
            
          if (integration) {
            // Fire and forget - attempt to delete the event but don't wait
            supabase.functions.invoke('delete-calendar-event', {
              body: {
                userId: user.id,
                eventId: task.google_calendar_event_id,
                calendarId: task.google_calendar_id
              }
            });
          }
        } catch (calendarError) {
          console.error('Error handling Google Calendar event deletion:', calendarError);
          // Continue with task deletion even if event deletion fails
        }
      }
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task from database:', error);
        throw new Error(error.message);
      }

      // Record the deletion in task history
      if (task) {
        await recordTaskHistory(id, task.title, 'deleted', 'Task deleted');
      }

      toast.success('Task deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Helper function to record task history
  const recordTaskHistory = async (taskId: string, taskTitle: string, action: 'created' | 'updated' | 'completed' | 'deleted' | 'synced', details?: string) => {
    try {
      if (!user) return;
      
      const historyData = {
        user_id: user.id,
        task_id: taskId,
        task_title: taskTitle,
        action: action,
        details: details || '',
        timestamp: new Date().toISOString()
      };
      
      console.log('Recording task history:', historyData);
      
      const { error } = await supabase
        .from('task_history')
        .insert(historyData);
        
      if (error) {
        console.error('Error recording task history:', error);
      }
    } catch (err) {
      console.error('Failed to record task history:', err);
    }
  };

  return {
    operationLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};
