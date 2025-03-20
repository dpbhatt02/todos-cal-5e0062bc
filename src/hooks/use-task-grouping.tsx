
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

    // Group future tasks by date
    const futureDatesGrouped: { [key: string]: TaskProps[] } = {};
    
    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(today, i);
      // Skip today as it's already handled separately
      if (i === 0) continue;
      
      const dateString = format(date, 'yyyy-MM-dd');
      futureDatesGrouped[dateString] = sortedTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return isSameDay(taskDate, date);
      });
    }

    return {
      overdueTasks: groupedTasks.overdue,
      todayTasks: groupedTasks.today,
      futureDatesGrouped
    };
  }, [sortedTasks, selectedDate]);

  return groupTasks();
};
