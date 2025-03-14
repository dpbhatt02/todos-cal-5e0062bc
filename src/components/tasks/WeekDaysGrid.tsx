
import React from 'react';
import WeekDay, { WeekDayData } from './WeekDay';

interface WeekDaysGridProps {
  weekDays: WeekDayData[];
  isMobile: boolean;
  useCompactView: boolean;
  onSelectDay: (date: Date) => void;
}

const WeekDaysGrid = ({ weekDays, isMobile, useCompactView, onSelectDay }: WeekDaysGridProps) => {
  return (
    <div className={`grid grid-cols-7 gap-0.5 sm:gap-1 border border-border rounded-lg ${
      isMobile 
        ? 'py-0.5 px-0.5' 
        : useCompactView 
          ? 'py-1 px-0.5' 
          : 'py-2 px-1'
    }`}>
      {weekDays.map((day, index) => (
        <WeekDay
          key={index}
          day={day}
          isMobile={isMobile}
          useCompactView={useCompactView}
          onSelectDay={onSelectDay}
        />
      ))}
    </div>
  );
};

export default WeekDaysGrid;
