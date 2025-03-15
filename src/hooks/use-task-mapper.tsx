
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
  };
};
