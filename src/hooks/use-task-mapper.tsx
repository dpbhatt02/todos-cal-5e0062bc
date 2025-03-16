
import { TaskProps } from '@/components/tasks/types';

// Convert database task to TaskProps
export const mapDbTaskToTask = (dbTask: any): TaskProps => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    priority: dbTask.priority as 'low' | 'medium' | 'high',
    dueDate: dbTask.due_date,
    completed: dbTask.completed,
    tags: [],
    // Add Google Calendar fields
    googleCalendarEventId: dbTask.google_calendar_event_id,
    googleCalendarId: dbTask.google_calendar_id,
    startTime: dbTask.start_time,
    endTime: dbTask.end_time,
    isAllDay: dbTask.is_all_day,
    syncSource: dbTask.sync_source,
    lastSyncedAt: dbTask.last_synced_at,
  };
};
