
import { useState } from 'react';
import { addDays, isSameDay } from 'date-fns';

export const useWeekController = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigate between weeks
  const previousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Check if the selected date is today
  const isSelectedDateToday = isSameDay(selectedDate, new Date());

  return {
    currentDate,
    selectedDate,
    isScrolled,
    setIsScrolled,
    setSelectedDate,
    previousWeek,
    nextWeek,
    goToToday,
    isSelectedDateToday
  };
};
