export interface TaskProps {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: any;
  completed: boolean;
  tags: string[];
  googleCalendarEventId?: string | null;
  googleCalendarId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    customDays?: string[];
    endDate?: any;
    endAfter?: number;
  };
  syncSource?: 'app' | 'google_calendar';
  lastSyncedAt?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  taskTitle: string;
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'synced';
  timestamp: Date;
  details?: string;
  userId: string;
}
