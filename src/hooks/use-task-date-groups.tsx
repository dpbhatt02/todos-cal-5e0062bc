
import { useCallback, useMemo } from 'react';
import { format, addDays, isSameDay, differenceInDays } from 'date-fns';
import { TaskProps } from '@/components/tasks/types';

export const useTaskDateGroups = (
  tasks: TaskProps[],
  viewOption: string,
  sortOption: string,
  customOrder: string[],
  selectedDate: Date
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
  
  // Group tasks
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
    
    // If there are task dates, find the latest one, otherwise use today + 30 days
    const latestTaskDate = taskDates.length > 0
      ? new Date(Math.max(...taskDates.map(date => date.getTime())))
      : addDays(today, 30);
    
    // Always show at least 30 days
    const daysToShow = Math.max(30, differenceInDays(latestTaskDate, today) + 1);

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

  return {
    sortedTasks,
    ...groupTasks()
  };
};
