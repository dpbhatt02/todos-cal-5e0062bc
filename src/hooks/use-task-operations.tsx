
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask, mapTaskToDb } from './use-task-mapper';

export const useTaskOperations = (user: any) => {
  const [operationLoading, setOperationLoading] = useState(false);

  // Create a new task
  const createTask = async (taskData: Omit<TaskProps, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return null;
    }

    try {
      setOperationLoading(true);
      
      // Prepare task data for database
      const dbTask = {
        user_id: user.id,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority,
        due_date: taskData.dueDate instanceof Date 
          ? taskData.dueDate.toISOString() 
          : taskData.dueDate,
        completed: taskData.completed || false,
        start_time: taskData.startTime,
        end_time: taskData.endTime,
        sync_source: 'app'
      };

      // Insert task into database
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Map to task props
      const newTask = mapDbTaskToTask(data);

      // Trigger sync to Google Calendar if integration exists
      syncTaskWithGoogleCalendar(user.id, newTask.id);

      toast.success('Task created successfully');
      return newTask;
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
      
      // Convert date to ISO string if it's a Date object
      if (updates.dueDate !== undefined) {
        dbUpdates.due_date = updates.dueDate instanceof Date 
          ? updates.dueDate.toISOString() 
          : updates.dueDate;
      }
      
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      
      // Mark as updated from app
      dbUpdates.sync_source = 'app';
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Trigger sync to Google Calendar
      syncTaskWithGoogleCalendar(user.id, id);

      return mapDbTaskToTask(data);
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
      
      // Check if we're dealing with mock data (IDs from mock data are numeric strings)
      if (/^\d+$/.test(id)) {
        console.log('Deleting mock task:', id);
        // For mock data, just return a successful result
        
        // Simulate a delay to make it feel more realistic
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast.success('Task deleted successfully');
        return true;
      }
      
      // Get task first to check if it has a Google Calendar event
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('google_calendar_event_id, google_calendar_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching task for deletion:', fetchError);
      }
      
      // If task has Google Calendar event, delete it from Google Calendar
      if (task?.google_calendar_event_id && task?.google_calendar_id) {
        deleteGoogleCalendarEvent(user.id, task.google_calendar_id, task.google_calendar_event_id);
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
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

  // Sync a task with Google Calendar
  const syncTaskWithGoogleCalendar = async (userId: string, taskId: string) => {
    try {
      // Call the sync function
      const { data, error } = await supabase.functions.invoke('sync-google-calendars', {
        body: { 
          userId, 
          direction: 'export',
          taskIds: [taskId]
        }
      });

      if (error) {
        console.error('Error syncing task with Google Calendar:', error);
      } else {
        console.log('Task synced with Google Calendar:', data);
      }
    } catch (err) {
      console.error('Error calling sync function:', err);
    }
  };

  // Delete an event from Google Calendar
  const deleteGoogleCalendarEvent = async (userId: string, calendarId: string, eventId: string) => {
    try {
      // Call a separate function to delete the event from Google Calendar
      const { data, error } = await supabase.functions.invoke('delete-google-calendar-event', {
        body: { 
          userId,
          calendarId,
          eventId
        }
      });

      if (error) {
        console.error('Error deleting event from Google Calendar:', error);
      } else {
        console.log('Event deleted from Google Calendar:', data);
      }
    } catch (err) {
      console.error('Error calling delete event function:', err);
    }
  };

  return {
    operationLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};
