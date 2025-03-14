
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTaskSync = () => {
  const [syncLoading, setSyncLoading] = useState(false);

  // Sync a task with Google Calendar
  const syncTaskWithGoogleCalendar = async (userId: string, taskId: string) => {
    try {
      setSyncLoading(true);
      console.log(`Syncing task ${taskId} with Google Calendar`);
      
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
    } finally {
      setSyncLoading(false);
    }
  };

  // Delete an event from Google Calendar
  const deleteGoogleCalendarEvent = async (userId: string, calendarId: string, eventId: string) => {
    try {
      setSyncLoading(true);
      console.log(`Deleting event ${eventId} from Google Calendar ${calendarId}`);
      
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
    } finally {
      setSyncLoading(false);
    }
  };

  return {
    syncTaskWithGoogleCalendar,
    deleteGoogleCalendarEvent,
    syncLoading
  };
};
