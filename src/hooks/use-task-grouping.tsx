
import { useCallback, useMemo } from 'react';
import { format, addDays, isSameDay, differenceInDays, isBefore, startOfDay } from 'date-fns';
import { TaskProps } from '@/components/tasks/types';

export const useTaskGrouping = (
  sortedTasks: TaskProps[],
  selectedDate: Date
) => {
  // Group tasks by date
  const groupTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateStart = startOfDay(selectedDate);
    
    // Find overdue and today's tasks
    const overdueTasks = sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today && !task.completed;
    });
    
    const todayTasks = sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return isSameDay(taskDate, selectedDate);
    });

    // Only include tasks on or after the selected date for future tasks
    const futureTasks = sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return !isSameDay(taskDate, selectedDate) && !isBefore(taskDate, selectedDateStart);
    });

    // Find the latest task date for setting range
    const taskDates = futureTasks.map(task => new Date(task.dueDate));
    
    // If there are task dates, find the latest one, otherwise use today + 60 days
    const latestTaskDate = taskDates.length > 0
      ? new Date(Math.max(...taskDates.map(date => date.getTime())))
      : addDays(selectedDateStart, 60);
    
    // Always show at least 60 days from the selected date
    const daysToShow = Math.max(60, differenceInDays(latestTaskDate, selectedDateStart) + 1);

    // Create empty arrays for dates with no tasks
    const futureDatesGrouped: { [key: string]: TaskProps[] } = {};
    
    // Initialize with empty arrays for all future dates starting from the selected date + 1
    // (since selected date is handled separately)
    for (let i = 1; i < daysToShow; i++) {
      const date = addDays(selectedDateStart, i);
      const dateString = format(date, 'yyyy-MM-dd');
      futureDatesGrouped[dateString] = [];
    }
    
    // Now populate with actual tasks
    futureTasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      // Skip if the task date is today or before (handled separately)
      if (isSameDay(taskDate, selectedDateStart) || isBefore(taskDate, selectedDateStart)) return;
      
      const dateString = format(taskDate, 'yyyy-MM-dd');
      if (futureDatesGrouped[dateString]) {
        futureDatesGrouped[dateString].push(task);
      }
    });

    return {
      overdueTasks,
      todayTasks,
      futureDatesGrouped
    };
  }, [sortedTasks, selectedDate]);

  // Memoize the result to prevent unnecessary recalculations
  return useMemo(() => groupTasks(), [groupTasks]);
};
