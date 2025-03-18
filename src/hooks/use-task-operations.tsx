
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask } from './use-task-mapper';
import { format, parseISO, addMinutes } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

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
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (err) {
      console.error('Error getting timezone:', err);
      return 'UTC'; // Default fallback
    }
  };

  // Helper function to properly format time with user's timezone
  const formatTimeForDB = (dateInput: string | Date, timeString: string | null): string | null => {
    if (!timeString) return null;
    
    try {
      // Extract date part based on type
      let datePart: string;
      
      if (dateInput instanceof Date) {
        // If it's a Date object, format it
        datePart = format(dateInput, 'yyyy-MM-dd');
      } else {
        // If it's a string, extract the date part
        datePart = dateInput.split('T')[0];
      }
      
      // Now we have the date part, combine with time
      const combinedDateTime = `${datePart}T${timeString}:00`;
      
      // Get user's timezone from profile or browser
      const userTimezone = getUserTimezone();
      console.log('Using timezone for time formatting:', userTimezone);
      
      // Create a Date object
      const date = new Date(`${datePart}T${timeString}:00`);
      
      // Format the time with the user's timezone
      return `${combinedDateTime}`;
    } catch (err) {
      console.error('Error formatting time:', err);
      return null;
    }
  };

  // Helper function to properly format date with user's timezone
  const formatDateForDB = (date: Date | string): string => {
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        // If it's an ISO string
        dateObj = new Date(date);
      } else {
        // It's already a Date object
        dateObj = date;
      }
      
      // Get the user's timezone
      const userTimezone = getUserTimezone();
      console.log('Using timezone for date formatting:', userTimezone);
      
      // Format the date in yyyy-MM-dd format
      const formattedDate = format(dateObj, 'yyyy-MM-dd');
      
      // Get time part (or set to 00:00:00 if not available)
      const timePart = dateObj.toISOString().split('T')[1].substring(0, 8);
      
      // Combine date and time with user's timezone indicator
      return `${formattedDate}T${timePart}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      // Fallback to ISO string without timezone
      if (date instanceof Date) {
        return date.toISOString();
      }
      return date;
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
      const dueDate = taskData.dueDate instanceof Date || typeof taskData.dueDate === 'string'
        ? formatDateForDB(taskData.dueDate)
        : null;

      // Format start and end times properly with timezone information
      let startTime = null;
      let endTime = null;
      
      if (taskData.startTime) {
        console.log('start time : '+ taskData.startTime);
        startTime = formatTimeForDB(dueDate || new Date(), taskData.startTime);
        console.log('Formatted start time:', startTime);
        
        // If end time is not provided, add 30 minutes to start time
        if (!taskData.endTime) {
          // Parse the start time
          const [hours, minutes] = taskData.startTime.split(':').map(Number);
          const startDateTime = new Date();
          if (taskData.dueDate instanceof Date) {
            startDateTime.setFullYear(taskData.dueDate.getFullYear());
            startDateTime.setMonth(taskData.dueDate.getMonth());
            startDateTime.setDate(taskData.dueDate.getDate());
          } else if (typeof taskData.dueDate === 'string') {
            const dueDateTime = new Date(taskData.dueDate);
            startDateTime.setFullYear(dueDateTime.getFullYear());
            startDateTime.setMonth(dueDateTime.getMonth());
            startDateTime.setDate(dueDateTime.getDate());
          }
          startDateTime.setHours(hours, minutes, 0, 0);
          
          // Add 30 minutes
          const endDateTime = addMinutes(startDateTime, 30);
          const endTimeString = format(endDateTime, 'HH:mm');
          
          endTime = formatTimeForDB(dueDate || new Date(), endTimeString);
          console.log('Generated end time:', endTime);
        } else {
          endTime = formatTimeForDB(dueDate || new Date(), taskData.endTime);
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
        .select('title')
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
      
      // Continue with real database update for UUID task IDs
      // Convert to database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      
      // Format due date with timezone information
      if (updates.dueDate !== undefined) {
        dbUpdates.due_date = updates.dueDate instanceof Date || typeof updates.dueDate === 'string'
          ? formatDateForDB(updates.dueDate)
          : null;
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
      if (updates.startTime !== undefined) {
        const dueDate = updates.dueDate || dbUpdates.due_date || new Date();
        dbUpdates.start_time = updates.startTime ? formatTimeForDB(dueDate, updates.startTime) : null;
        
        // Update is_all_day when setting a time
        if (updates.startTime && dbUpdates.is_all_day === undefined) {
          dbUpdates.is_all_day = false;
        }
      }
      
      if (updates.endTime !== undefined) {
        const dueDate = updates.dueDate || dbUpdates.due_date || new Date();
        dbUpdates.end_time = updates.endTime ? formatTimeForDB(dueDate, updates.endTime) : null;
        
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
