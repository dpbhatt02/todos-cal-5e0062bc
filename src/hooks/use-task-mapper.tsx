
import { TaskProps } from '@/components/tasks/types';
import { formatTimeInTimezone } from '@/utils/timezone';

// Helper to format time from DB for display
const formatDbTimeForDisplay = (timeString: string | null): string | null => {
  if (!timeString) return null;
  
  try {
    // Format the ISO time string in the user's timezone
    return formatTimeInTimezone(timeString).replace(/\s/g, '');
  } catch (err) {
    console.error('Error formatting DB time:', err, timeString);
    return null;
  }
};

// Convert database task to TaskProps
export const mapDbTaskToTask = (dbTask: any): TaskProps => {
  // Process start and end times for UI display
  let startTime: string | null = null;
  let endTime: string | null = null;
  
  if (dbTask.start_time) {
    // Extract just the time part for the UI
    startTime = formatDbTimeForDisplay(dbTask.start_time);
  }
  
  if (dbTask.end_time) {
    // Extract just the time part for the UI
    endTime = formatDbTimeForDisplay(dbTask.end_time);
  }
  
  const task: TaskProps = {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    priority: dbTask.priority as 'low' | 'medium' | 'high',
    dueDate: dbTask.due_date,
    completed: dbTask.completed,
    tags: [],
    // Add time-related fields
    startTime,
    endTime,
    isAllDay: dbTask.is_all_day,
    // Add Google Calendar fields
    googleCalendarEventId: dbTask.google_calendar_event_id,
    googleCalendarId: dbTask.google_calendar_id,
    syncSource: dbTask.sync_source,
    lastSyncedAt: dbTask.last_synced_at,
  };

  // Add recurring data if present
  if (dbTask.recurring_frequency) {
    // Make sure the frequency is one of the allowed types
    const validFrequencies = ['daily', 'weekly', 'monthly', 'custom'] as const;
    const frequency = validFrequencies.includes(dbTask.recurring_frequency) 
      ? dbTask.recurring_frequency 
      : 'custom';
      
    task.recurring = {
      frequency: frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
      customDays: dbTask.recurring_custom_days || [],
      endDate: dbTask.recurring_end_date,
      endAfter: dbTask.recurring_end_after
    };
  }

  return task;
};
