
import { TaskProps } from '@/components/tasks/types';
import { formatTimeInTimezone } from '@/utils/timezone';

// Define type for task data from database including recurring fields
interface DbTaskWithRecurring extends Record<string, any> {
  recurring_frequency?: string;
  recurring_custom_days?: string[];
  recurring_end_date?: string;
  recurring_end_after?: number;
}

// Helper to convert times from database to 24-hour format for inputs
const formatDbTimeFor24HourInput = (timeString: string | null): string | null => {
  if (!timeString) return null;
  
  try {
    // If already in 24-hour format (e.g., "14:30"), return as is
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }
    
    // Remove any spaces and handle AM/PM conversion
    const cleanTimeString = timeString.replace(/\s/g, '');
    const match = cleanTimeString.match(/^(\d+):(\d+)(?::\d+)?(?:\s*)?(AM|PM|am|pm)?$/);
    
    if (match) {
      let [_, hours, minutes, period] = match;
      let hoursNum = parseInt(hours, 10);
      
      // Handle AM/PM conversion to 24-hour
      if (period && (period.toUpperCase() === 'PM') && hoursNum < 12) {
        hoursNum += 12;
      } else if (period && (period.toUpperCase() === 'AM') && hoursNum === 12) {
        hoursNum = 0;
      }
      
      // Format back to HH:MM
      return `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // If we can't parse it properly, format using our timezone utility
    const formattedTime = formatTimeInTimezone(timeString);
    // Extract just the time part (e.g., "14:30") without AM/PM
    const timeMatch = formattedTime.match(/(\d+):(\d+)/);
    if (timeMatch) {
      return timeMatch[0];
    }
    
    return timeString; // Return original as fallback
  } catch (err) {
    console.error('Error formatting DB time:', err, timeString);
    return null;
  }
};

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
export const mapDbTaskToTask = (dbTask: DbTaskWithRecurring): TaskProps => {
  // Process start and end times for UI display
  let startTime: string | null = null;
  let endTime: string | null = null;
  
  if (dbTask.start_time) {
    // For task card display we use the AM/PM format
    startTime = formatDbTimeForDisplay(dbTask.start_time);
  }
  
  if (dbTask.end_time) {
    // For task card display we use the AM/PM format
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
    const frequency = validFrequencies.includes(dbTask.recurring_frequency as any) 
      ? dbTask.recurring_frequency as 'daily' | 'weekly' | 'monthly' | 'custom'
      : 'custom';
      
    task.recurring = {
      frequency,
      customDays: dbTask.recurring_custom_days || [],
      endDate: dbTask.recurring_end_date,
      endAfter: dbTask.recurring_end_after
    };
  }

  return task;
};
