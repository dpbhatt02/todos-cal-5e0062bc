
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { mapDbTaskToTask } from '../use-task-mapper';
import { ensureDateFormat } from '@/components/tasks/utils';

export const useTaskCreate = (user: any) => {
  const [createLoading, setCreateLoading] = useState(false);

  // Create a new task
  const createTask = async (taskData: Omit<TaskProps, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return null;
    }

    try {
      setCreateLoading(true);
      
      // Ensure date is in correct format
      const dueDate = taskData.dueDate ? ensureDateFormat(taskData.dueDate) : null;
      
      // Prepare task data for database
      const dbTask = {
        user_id: user.id,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority,
        due_date: dueDate,
        completed: taskData.completed || false,
        start_time: taskData.startTime,
        end_time: taskData.endTime,
        sync_source: 'app'
      };

      console.log("Creating task with data:", dbTask);

      // Insert task into database
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message);
      }

      // Map to task props
      const newTask = mapDbTaskToTask(data);

      toast.success('Task created successfully');
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    createTask,
    createLoading
  };
};
