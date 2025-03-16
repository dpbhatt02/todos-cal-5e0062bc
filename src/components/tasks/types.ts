
export interface TaskProps {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | Date;
  completed: boolean;
  tags: string[];
  recurring?: {
    frequency: string;
    customDays?: string[];
    endDate?: Date;
    endAfter?: number;
  };
  // Google Calendar integration fields
  googleCalendarEventId?: string;
  googleCalendarId?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  syncSource?: 'app' | 'calendar';
  lastSyncedAt?: string;
}

export interface TaskDate {
  date: Date;
  tasks: TaskProps[];
}

export interface TaskDateGroup {
  name: string;
  description?: string;
  dates: TaskDate[];
}

export interface DateGroup {
  title: string;
  dates: Date[];
  tasks: TaskProps[];
}
