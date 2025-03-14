
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
    startTime: dbTask.start_time || undefined,
    endTime: dbTask.end_time || undefined,
    tags: dbTask.tags || [],
    googleCalendarEventId: dbTask.google_calendar_event_id,
    googleCalendarId: dbTask.google_calendar_id,
    lastSyncedAt: dbTask.last_synced_at,
    isAllDay: dbTask.is_all_day,
    syncSource: dbTask.sync_source
  };
};

// Convert TaskProps to database format
export const mapTaskToDb = (task: TaskProps, userId: string) => {
  return {
    user_id: userId,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
    completed: task.completed,
    start_time: task.startTime,
    end_time: task.endTime,
    google_calendar_event_id: task.googleCalendarEventId,
    google_calendar_id: task.googleCalendarId,
    last_synced_at: task.lastSyncedAt,
    is_all_day: task.isAllDay,
    sync_source: task.syncSource || 'app'
  };
};
