
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { WeekDayData } from '../WeekDay';
import { TaskProps } from '../types';

export const getWeekDays = (currentDate: Date, selectedDate: Date, tasks: TaskProps[], isMobile: boolean): WeekDayData[] => {
  const days: WeekDayData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday

  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    days.push({
      date,
      day: format(date, 'd'),
      weekday: isMobile ? format(date, 'EEEEE') : format(date, 'EEE'), // Single letter for mobile, 3 letters otherwise
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate),
      hasTask: tasks.some(task => {
        // Ensure we handle both Date objects and string dates
        const taskDate = task.dueDate instanceof Date 
          ? task.dueDate 
          : new Date(task.dueDate);
        return isSameDay(taskDate, date);
      })
    });
  }
  
  return days;
};
