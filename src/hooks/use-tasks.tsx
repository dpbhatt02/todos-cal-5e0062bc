
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TaskProps } from '@/components/tasks/types';
import { mapDbTaskToTask } from './use-task-mapper';
import { useTaskOperations } from './use-task-operations';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { operationLoading, createTask, updateTask, deleteTask } = useTaskOperations(user);

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

        // Filter tasks to only show those on or after March 12, 2025
        const minDate = new Date('2025-03-12T00:00:00.000Z');
        
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .gte('due_date', minDate.toISOString())
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
          
          // For new or updated tasks, make sure they meet the date filter
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const taskDate = new Date(payload.new.due_date);
            const minDate = new Date('2025-03-12T00:00:00.000Z');
            
            // Only process tasks on or after March 12, 2025
            if (taskDate >= minDate) {
              if (payload.eventType === 'INSERT') {
                setTasks(prev => [...prev, mapDbTaskToTask(payload.new)]);
              } else if (payload.eventType === 'UPDATE') {
                setTasks(prev => prev.map(task => 
                  task.id === payload.new.id ? mapDbTaskToTask(payload.new) : task
                ));
              }
            }
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

  return {
    tasks,
    loading,
    error: error || null,
    createTask,
    updateTask,
    deleteTask,
    operationLoading,
  };
}
