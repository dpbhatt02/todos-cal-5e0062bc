
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TaskProps } from '@/components/tasks/types';
import { mapDbTaskToTask } from './use-task-mapper';
import { useTaskOperations } from './use-task-operations';
import { mockTasks } from '@/components/tasks/mockData';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { operationLoading, createTask, updateTask, deleteTask } = useTaskOperations(user);

  // Check if user has Google Calendar connected
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const checkCalendarConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('user_integrations')
          .select('connected')
          .eq('user_id', user.id)
          .eq('provider', 'google_calendar')
          .maybeSingle();
          
        if (error) {
          console.error('Error checking calendar connection:', error);
          return;
        }
        
        setIsCalendarConnected(data?.connected || false);
      } catch (err) {
        console.error('Error checking calendar connection:', err);
      }
    };
    
    checkCalendarConnection();
  }, [user]);

  // Fetch tasks
  useEffect(() => {
    if (!user) {
      // Use mock data when no user is logged in
      console.log('No user logged in, using mock data');
      setTasks(mockTasks);
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
        
        // If there are no tasks in the database, use mock data
        if (mappedTasks.length === 0) {
          console.log('No tasks in database, using mock data');
          setTasks(mockTasks);
        } else {
          setTasks(mappedTasks);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
        // Use mock data in case of error
        setTasks(mockTasks);
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

  // Function to sync task to Google Calendar
  const syncTaskToCalendar = async (taskId: string) => {
    if (!user || !isCalendarConnected) return false;
    console.log('syncTaskToCalendar is running with a taskId'); //db log
    
    try {
      setSyncing(true);
      const toastId = toast.loading('Syncing task to Google Calendar...');
      
      const { data, error } = await supabase.functions.invoke(
        'sync-tasks-to-calendar',
        {
          body: {
            userId: user.id,
            taskId
          }
        }
      );
      
      // Always dismiss the loading toast
      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error syncing task to calendar:', error);
        toast.error('Failed to sync task to calendar');
        return false;
      }
      
      console.log('Task sync result:', data);
      
      if (data.success) {
        toast.success('Task synced to Google Calendar');
        return true;
      } else {
        toast.error(data.error || 'Failed to sync task to calendar');
        return false;
      }
    } catch (err) {
      console.error('Error syncing task to calendar:', err);
      toast.error('Failed to sync task to calendar');
      return false;
    } finally {
      setSyncing(false);
    }
  };
  
  // Function to sync all tasks to Google Calendar
  const syncAllTasksToCalendar = async () => {
    if (!user || !isCalendarConnected) return false;
    
    try {
      setSyncing(true);
      const toastId = toast.loading('Syncing tasks to Google Calendar...');
      
      console.log('syncAllTasksToCalendar is running with userId'); //db log
      const { data, error } = await supabase.functions.invoke(
        'sync-tasks-to-calendar',
        {
          body: {
            userId: user.id
          }
        }
      );
     
      // Always dismiss the loading toast
      toast.dismiss(toastId);
      
      if (error) {
         console.error('Error syncing tasks to calendar:', error);
         toast.error('Failed to sync tasks to calendar');
         return false;
      }
      
      console.log('Tasks sync result:', data);
      
      if (data.success) {
        toast.success(`${data.message}`);
        return true;
      } else {
        toast.error(data.error || 'Failed to sync tasks to calendar');
        return false;
      }
    } catch (err) {
      console.error('Error syncing tasks to calendar:', err);
      toast.error('Failed to sync tasks to calendar');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Function to sync events from Google Calendar to tasks
  const syncCalendarToTasks = async () => {
    if (!user || !isCalendarConnected) return false;
    
    try {
      setSyncing(true);
      const toastId = toast.loading('Syncing events from Google Calendar...');
      
      const { data, error } = await supabase.functions.invoke(
        'sync-calendar-to-tasks',
        {
          body: {
            userId: user.id
          }
        }
      );
      
      // Always dismiss the loading toast
      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error syncing calendar to tasks:', error);
        toast.error('Failed to sync calendar events');
        return false;
      }
      
      console.log('Calendar sync result:', data);
      
      if (data.success) {
        toast.success(`${data.message}`);
        return true;
      } else {
        toast.error(data.error || 'Failed to sync calendar events');
        return false;
      }
    } catch (err) {
      console.error('Error syncing calendar to tasks:', err);
      toast.error('Failed to sync calendar events');
      return false;
    } finally {
      setSyncing(false);
    }
  };
  
  // Function to perform bidirectional sync
  const synchronizeWithCalendar = async () => {
    if (!user || !isCalendarConnected) {
      toast.error('Google Calendar is not connected');
      return false;
    }
    
    try {
      setSyncing(true);
      const toastId = toast.loading('Synchronizing with Google Calendar...');
      
      // First sync calendar events to tasks
      const calendarToTasksResult = await syncCalendarToTasks();
      
      // Then sync tasks to calendar
      const tasksToCalendarResult = await syncAllTasksToCalendar();
      
      // Always dismiss the main loading toast
      toast.dismiss(toastId);
      
      if (calendarToTasksResult && tasksToCalendarResult) {
        toast.success('Synchronization with Google Calendar completed');
        return true;
      } else {
        toast.warning('Synchronization partially completed');
        return false;
      }
    } catch (err) {
      console.error('Error synchronizing with calendar:', err);
      toast.error('Synchronization failed');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  return {
    tasks,
    loading,
    error: error || null,
    createTask,
    updateTask,
    deleteTask,
    operationLoading,
    syncing,
    syncTaskToCalendar,
    syncAllTasksToCalendar,
    syncCalendarToTasks,
    synchronizeWithCalendar,
    isCalendarConnected
  };
}
