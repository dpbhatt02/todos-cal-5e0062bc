
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

// Priority classes for styling
export const priorityClasses = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
  default: "bg-slate-400"
};

// Tag colors for styling
export const tagColors: Record<string, string> = {
  work: "bg-blue-500",
  personal: "bg-violet-500",
  health: "bg-green-500",
  education: "bg-amber-500",
  finance: "bg-emerald-500",
  travel: "bg-rose-500",
  home: "bg-teal-500",
  shopping: "bg-indigo-500",
  family: "bg-pink-500",
  social: "bg-orange-500",
  default: "bg-slate-400"
};
