
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTaskDelete = (user: any) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete tasks');
      return false;
    }

    try {
      setDeleteLoading(true);
      
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
      setDeleteLoading(false);
    }
  };

  return {
    deleteTask,
    deleteLoading
  };
};
