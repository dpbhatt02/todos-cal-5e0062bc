import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask } from './use-task-mapper';
import { format, parseISO, addMinutes } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { dateAndTimeToISOWithTimezone } from '@/utils/timezone';

export const useTaskOperations = (user: any) => {
  const [operationLoading, setOperationLoading] = useState(false);
  const { user: authUser } = useAuth();

  // Create a new task
  const createTask = async (taskData: Omit<TaskProps, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return null;
    }

    try {
      setOperationLoading(true);
      console.log('Creating task with data:', taskData); // Debug log
      
      // IMPORTANT: For date-only tasks, we need to store JUST the date without any time
      // Format due date without time component
      let dueDate = null;
      if (taskData.dueDate) {
        if (typeof taskData.dueDate === 'string') {
          // Use the date string directly if it's already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(taskData.dueDate)) {
            const [year, month, day] = taskData.dueDate.split('-').map(Number);
            dueDate = new Date(Date.UTC(year, month - 1, day)).toISOString();
          } else {
            // Otherwise parse the date string
            const date = new Date(taskData.dueDate);
            dueDate = new Date(Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            )).toISOString();
          }
        } else {
          // Handle Date object
          dueDate = new Date(Date.UTC(
            taskData.dueDate.getFullYear(),
            taskData.dueDate.getMonth(),
            taskData.dueDate.getDate()
          )).toISOString();
        }
      }
      
      console.log('Formatted due date:', dueDate); // executing till this
      console.log('Formatted due date type:', typeof dueDate); //let's see if it is string or not
      console.log('Formatted due date type:', typeof taskData.dueDate); //let's see if it is string or not
      // Process start and end times
      let startTime = null;
      let endTime = null;
      let isAllDay = taskData.isAllDay !== undefined ? taskData.isAllDay : true;
      
      // Only process time if it's explicitly not an all-day task
      if (taskData.isAllDay === false && taskData.startTime && typeof taskData.dueDate === 'string') {
        console.log('Processing time for non-all-day task');
        
        // Extract date string in YYYY-MM-DD format
        let dateStr = taskData.dueDate;
        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const date = new Date(taskData.dueDate);
          dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
        
        // Log the input values for debugging
        console.log('Converting to ISO with timezone:', dateStr, taskData.startTime);
        
        startTime = dateAndTimeToISOWithTimezone(dateStr, taskData.startTime);
        console.log('Processed start time:', startTime);
        
        if (taskData.endTime) {
          endTime = dateAndTimeToISOWithTimezone(dateStr, taskData.endTime);
          console.log('Processed end time:', endTime);
        } else if (startTime) {
          // Add 30 minutes to start time for end time
          const startDate = new Date(startTime);
          const endDate = addMinutes(startDate, 30);
          endTime = endDate.toISOString();
          console.log('Generated end time (+30 mins):', endTime);
        }
        
        // Ensure isAllDay is false when we have start time
        isAllDay = false;
      }

      // Prepare the task data for database
      const taskDbData = {
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: dueDate,
        completed: taskData.completed || false,
        sync_source: 'app',
        start_time: startTime,
        end_time: endTime,
        is_all_day: isAllDay,
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
      
      // Format due date - storing just the date in UTC
      if (updates.dueDate !== undefined) {
        if (updates.dueDate) {
          let dateObj;
          if (typeof updates.dueDate === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(updates.dueDate)) {
              // Already in YYYY-MM-DD format
              const [year, month, day] = updates.dueDate.split('-').map(Number);
              dateObj = new Date(Date.UTC(year, month - 1, day));
            } else {
              dateObj = new Date(updates.dueDate);
            }
          } else {
            dateObj = updates.dueDate;
          }
          
          // Store date-only in UTC to avoid timezone issues
          dbUpdates.due_date = new Date(Date.UTC(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate()
          )).toISOString();
        } else {
          dbUpdates.due_date = null;
        }
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
      
      // Special handling for time fields
      if (updates.isAllDay === false && updates.startTime) {
        let dateStr;
        if (typeof updates.dueDate === 'string') {
          // If dueDate is provided in the updates, use it
          if (/^\d{4}-\d{2}-\d{2}$/.test(updates.dueDate)) {
            dateStr = updates.dueDate;
          } else {
            const date = new Date(updates.dueDate);
            dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }
        } else if (existingTask.due_date) {
          // Otherwise use the existing due_date
          const date = new Date(existingTask.due_date);
          dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
        
        if (dateStr) {
          console.log('Converting to ISO with timezone for update:', dateStr, updates.startTime);
          
          dbUpdates.start_time = dateAndTimeToISOWithTimezone(dateStr, updates.startTime);
          console.log('Updated start time:', dbUpdates.start_time);
          
          if (updates.endTime) {
            dbUpdates.end_time = dateAndTimeToISOWithTimezone(dateStr, updates.endTime);
            console.log('Updated end time:', dbUpdates.end_time);
          } else if (dbUpdates.start_time) {
            // Auto-generate end time (start + 30 min) if not provided
            const startDateTime = new Date(dbUpdates.start_time);
            const endDateTime = addMinutes(startDateTime, 30);
            dbUpdates.end_time = endDateTime.toISOString();
            console.log('Generated end time (+30 mins):', dbUpdates.end_time);
          }
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
