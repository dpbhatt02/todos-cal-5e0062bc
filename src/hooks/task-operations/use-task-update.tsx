
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask } from '../use-task-mapper';
import { ensureDateFormat } from '@/components/tasks/utils';

export const useTaskUpdate = (user: any) => {
  const [updateLoading, setUpdateLoading] = useState(false);

  // Update a task
  const updateTask = async (id: string, updates: Partial<TaskProps>) => {
    if (!user) {
      toast.error('You must be logged in to update tasks');
      return null;
    }

    try {
      setUpdateLoading(true);
      
      console.log("Updating task:", id, "with data:", updates);
      
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
      
      // Convert date to ISO string if it's a Date object or string date
      if (updates.dueDate !== undefined) {
        dbUpdates.due_date = ensureDateFormat(updates.dueDate);
      }
      
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      
      // Mark as updated from app
      dbUpdates.sync_source = 'app';
      dbUpdates.updated_at = new Date().toISOString();

      console.log("Sending to database:", dbUpdates);

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }

      console.log("Update successful, response:", data);

      return mapDbTaskToTask(data);
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    } finally {
      setUpdateLoading(false);
    }
  };

  return {
    updateTask,
    updateLoading
  };
};
