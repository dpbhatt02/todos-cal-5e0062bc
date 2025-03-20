
import { useCallback } from 'react';
import { format, addDays, isSameDay, differenceInDays } from 'date-fns';
import { TaskProps } from '@/components/tasks/types';

export const useTaskGrouping = (
  sortedTasks: TaskProps[],
  selectedDate: Date
) => {
  // Group tasks by date
  const groupTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find overdue and today's tasks
    const groupedTasks = {
      overdue: sortedTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today && !task.completed;
      }),
      today: sortedTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return isSameDay(taskDate, selectedDate);
      })
    };

    // Find the earliest and latest task dates
    const taskDates = sortedTasks.map(task => new Date(task.dueDate));
    
    // If there are task dates, find the latest one, otherwise use today + 60 days
    const latestTaskDate = taskDates.length > 0
      ? new Date(Math.max(...taskDates.map(date => date.getTime())))
      : addDays(today, 60);
    
    // Always show at least 60 days
    const daysToShow = Math.max(60, differenceInDays(latestTaskDate, today) + 1);

    // Create empty arrays for dates with no tasks
    const futureDatesGrouped: { [key: string]: TaskProps[] } = {};
    
    // Initialize with empty arrays for all future dates up to daysToShow
    for (let i = 1; i < daysToShow; i++) { // Start from 1 to skip today
      const date = addDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      futureDatesGrouped[dateString] = [];
    }
    
    // Now populate with actual tasks
    sortedTasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      // Skip if it's today or before (handled separately)
      if (taskDate <= today) return;
      
      const dateString = format(taskDate, 'yyyy-MM-dd');
      if (futureDatesGrouped[dateString]) {
        futureDatesGrouped[dateString].push(task);
      }
    });

    return {
      overdueTasks: groupedTasks.overdue,
      todayTasks: groupedTasks.today,
      futureDatesGrouped
    };
  }, [sortedTasks, selectedDate]);

  return groupTasks();
};
