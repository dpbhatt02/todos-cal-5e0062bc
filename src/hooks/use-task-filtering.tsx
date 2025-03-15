
import { useMemo } from 'react';
import { TaskProps } from '@/components/tasks/types';

export const useTaskFiltering = (
  tasks: TaskProps[],
  viewOption: string,
  sortOption: string,
  customOrder: string[]
) => {
  // Filter tasks based on view option
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      return viewOption === 'all' 
        || (viewOption === 'completed' && task.completed)
        || (viewOption === 'active' && !task.completed);
    });
  }, [tasks, viewOption]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortOption === 'custom') {
        return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
      } else if (sortOption === 'date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortOption === 'priority') {
        const priorityWeight = { low: 0, medium: 1, high: 2 };
        return priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight];
      }
      return 0;
    });
  }, [filteredTasks, sortOption, customOrder]);

  return { filteredTasks, sortedTasks };
};
