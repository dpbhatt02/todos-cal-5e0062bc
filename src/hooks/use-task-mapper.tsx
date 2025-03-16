
import { TaskProps } from '@/components/tasks/types';

// Convert database task to TaskProps
export const mapDbTaskToTask = (dbTask: any): TaskProps => {
  const task: TaskProps = {
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
