import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask } from './use-task-mapper';
import { format, parseISO } from 'date-fns';

export const useTaskOperations = (user: any) => {
  const [operationLoading, setOperationLoading] = useState(false);

  // Helper function to properly format time for Postgres timestamp
  const formatTimeForDB = (dateInput: string | Date, timeString: string, utcTimeString?: string): string => {
    try {
      // If a UTC time string is provided, use it directly
      if (utcTimeString) {
        return utcTimeString;
      }
      
      // Extract date part based on type
      let datePart: string;
      
      if (dateInput instanceof Date) {
        // If it's a Date object, format it
        datePart = format(dateInput, 'yyyy-MM-dd');
      } else {
        // If it's a string, extract the date part
        datePart = dateInput.split('T')[0];
      }
      
      // Parse the time parts
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Create a new Date object using the date and time
      const dateObj = new Date(
        parseInt(datePart.split('-')[0]),
        parseInt(datePart.split('-')[1]) - 1,
        parseInt(datePart.split('-')[2]),
        hours,
        minutes
      );
      
      // Convert to ISO string for database (which will be in UTC)
      return dateObj.toISOString();
    } catch (err) {
      console.error('Error formatting time:', err);
      return timeString;
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
      
      // Convert date to ISO string if it's a Date object
      const dueDate = taskData.dueDate instanceof Date 
        ? taskData.dueDate.toISOString() 
        : taskData.dueDate;

      // Format start and end times properly
      let startTime = null;
      let endTime = null;
      
      if (taskData.startTime) {
        startTime = formatTimeForDB(dueDate, taskData.startTime, (taskData as any).startTimeUtc);
        console.log('Formatted start time:', startTime);
      }
      
      if (taskData.endTime) {
        endTime = formatTimeForDB(dueDate, taskData.endTime, (taskData as any).endTimeUtc);
        console.log('Formatted end time:', endTime);
      }

      // Log task creation to history
      try {
        await supabase.from('task_history').insert({
          user_id: user.id,
          task_id: 'pending', // Will be updated after task creation
          task_title: taskData.title,
          action: 'created',
          timestamp: new Date().toISOString(),
          details: `Priority: ${taskData.priority}`
        });
      } catch (historyErr) {
        console.error('Failed to record task creation history:', historyErr);
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

      // If Google Calendar is connected, try to sync the new task
      try {
        const { data: integration } = await supabase
          .from('user_integrations')
          .select('connected')
          .eq('user_id', user.id)
          .eq('provider', 'google_calendar')
          .maybeSingle();
          
        // Note: We've moved the actual sync functionality to the Tasks.tsx component
        // to respect the auto-sync setting
      } catch (syncError) {
        console.error('Error checking calendar integration:', syncError);
        // Continue without syncing
      }

      // Update the history record with the actual task ID
      if (data) {
        try {
          await supabase
            .from('task_history')
            .update({ task_id: data.id })
            .eq('user_id', user.id)
            .eq('task_id', 'pending')
            .eq('task_title', taskData.title);
        } catch (updateErr) {
          console.error('Failed to update task history with ID:', updateErr);
        }
      }

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
      
      // Convert date to ISO string if it's a Date object
      if (updates.dueDate !== undefined) {
        dbUpdates.due_date = updates.dueDate instanceof Date 
          ? updates.dueDate.toISOString() 
          : updates.dueDate;
      }
      
      // Format start and end times properly
      if (updates.startTime !== undefined) {
        const dueDate = updates.dueDate || dbUpdates.due_date;
        dbUpdates.start_time = updates.startTime ? formatTimeForDB(dueDate, updates.startTime) : null;
      }
      
      if (updates.endTime !== undefined) {
        const dueDate = updates.dueDate || dbUpdates.due_date;
        dbUpdates.end_time = updates.endTime ? formatTimeForDB(dueDate, updates.endTime) : null;
      }
      
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.isAllDay !== undefined) dbUpdates.is_all_day = updates.isAllDay;
      
      // Mark that this update came from the app
      dbUpdates.sync_source = 'app';
      dbUpdates.updated_at = new Date().toISOString();

      // Log task update to history
      try {
        // Get the task title first
        const { data: taskData } = await supabase
          .from('tasks')
          .select('title')
          .eq('id', id)
          .single();
          
        if (taskData) {
          await supabase.from('task_history').insert({
            user_id: user.id,
            task_id: id,
            task_title: updates.title || taskData.title,
            action: 'updated',
            timestamp: new Date().toISOString(),
            details: updates.completed !== undefined 
              ? `Marked as ${updates.completed ? 'completed' : 'incomplete'}`
              : 'Details modified'
          });
        }
      } catch (historyErr) {
        console.error('Failed to record task update history:', historyErr);
      }

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

      // If the task has a Google Calendar event ID, try to sync the update
      if (data.google_calendar_event_id) {
        try {
          // Fire and forget - don't wait for the result
          supabase.functions.invoke('sync-tasks-to-calendar', {
            body: { userId: user.id, taskId: data.id }
          });
        } catch (syncError) {
          console.error('Error syncing task update to calendar:', syncError);
          // Continue without syncing
        }
      }

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
      
      // Check if we're dealing with mock data (IDs from mock data are numeric strings)
      if (/^\d+$/.test(id)) {
        console.log('Deleting mock task:', id);
        // For mock data, just return a successful result
        
        // Simulate a delay to make it feel more realistic
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast.success('Task deleted successfully');
        return true;
      }
      
      // Check if this task has a Google Calendar event that needs to be deleted
      const { data: task } = await supabase
        .from('tasks')
        .select('google_calendar_event_id, google_calendar_id')
        .eq('id', id)
        .single();
        
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
      
      // Get task title before deletion for history
      try {
        const { data: taskData } = await supabase
          .from('tasks')
          .select('title')
          .eq('id', id)
          .single();
          
        if (taskData) {
          await supabase.from('task_history').insert({
            user_id: user.id,
            task_id: id,
            task_title: taskData.title,
            action: 'deleted',
            timestamp: new Date().toISOString()
          });
        }
      } catch (historyErr) {
        console.error('Failed to record task deletion history:', historyErr);
      }
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task from database:', error);
        throw new Error(error.message);
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

  return {
    operationLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};
