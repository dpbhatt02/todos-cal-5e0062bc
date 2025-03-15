
import { useMemo } from 'react';
import { useTaskFiltering } from './use-task-filtering';
import { useTaskGrouping } from './use-task-grouping';
import { TaskProps } from '@/components/tasks/types';

export const useTaskDateGroups = (
  tasks: TaskProps[],
  viewOption: string,
  sortOption: string,
  customOrder: string[],
  selectedDate: Date
) => {
  // Filter and sort tasks
  const { sortedTasks } = useTaskFiltering(tasks, viewOption, sortOption, customOrder);
  
  // Group tasks by date
  const { overdueTasks, todayTasks, futureDatesGrouped } = useTaskGrouping(sortedTasks, selectedDate);

  return {
    sortedTasks,
    overdueTasks,
    todayTasks,
    futureDatesGrouped
  };
};
