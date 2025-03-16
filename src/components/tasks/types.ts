
export interface TaskProps {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | Date;
  completed: boolean;
  tags: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
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
  // Add these for component props
  onEdit?: (task: TaskProps) => void;
  onDelete?: (taskId: string) => void;
  onReschedule?: (taskId: string, newDate: Date) => void;
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

// Add these missing exports referenced in the errors
export const tagColors: Record<string, string> = {
  work: 'bg-blue-500',
  personal: 'bg-green-500',
  health: 'bg-red-500',
  finance: 'bg-yellow-500',
  education: 'bg-purple-500',
  social: 'bg-pink-500',
  family: 'bg-orange-500',
  travel: 'bg-teal-500',
  hobby: 'bg-indigo-500',
  home: 'bg-lime-500',
  // Default color if tag doesn't match
  default: 'bg-gray-400'
};

export const priorityClasses: Record<string, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
  default: 'bg-priority-medium'
};
