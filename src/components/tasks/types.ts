
export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | string;
  completed: boolean;
  tags?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    endDate?: Date | string;
    endAfter?: number;
    customDays?: string[];
  };
  onEdit?: (task: TaskProps) => void;
  onDelete?: (id: string) => void;
  onReschedule?: (id: string, newDate: Date) => void;
}

export const priorityClasses: Record<string, string> = {
  low: 'bg-priority-low',
  medium: 'bg-priority-medium',
  high: 'bg-priority-high'
};

export const tagColors: Record<string, string> = {
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  health: 'bg-green-500',
  learning: 'bg-amber-500'
};
