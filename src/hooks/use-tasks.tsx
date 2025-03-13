
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Convert database task to TaskProps
  const mapDbTaskToTask = (dbTask: any): TaskProps => {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      priority: dbTask.priority as 'low' | 'medium' | 'high',
      dueDate: dbTask.due_date,
      completed: dbTask.completed,
      tags: [],
    };
  };

  // Fetch tasks
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('due_date', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        // Map data to TaskProps
        const mappedTasks = data.map(mapDbTaskToTask);
        setTasks(mappedTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, mapDbTaskToTask(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? mapDbTaskToTask(payload.new) : task
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Create a new task
  const createTask = async (taskData: Omit<TaskProps, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          completed: taskData.completed || false,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Task created successfully');
      return mapDbTaskToTask(data);
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<TaskProps>) => {
    if (!user) {
      toast.error('You must be logged in to update tasks');
      return null;
    }

    try {
      // Convert to database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return mapDbTaskToTask(data);
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete tasks');
      return false;
    }

    try {
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
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
}
