
import React from 'react';
import { isSameDay } from 'date-fns';

export interface WeekDayData {
  date: Date;
  day: string;
  weekday: string;
  isToday: boolean;
  isSelected: boolean;
  hasTask: boolean;
}

interface WeekDayProps {
  day: WeekDayData;
  isMobile: boolean;
  useCompactView: boolean;
  onSelectDay: (date: Date) => void;
}

const WeekDay = ({ day, isMobile, useCompactView, onSelectDay }: WeekDayProps) => {
  return (
    <button
      onClick={() => onSelectDay(day.date)}
      className={`flex flex-col items-center ${
        isMobile 
          ? 'p-0.5' 
          : useCompactView 
            ? 'p-0.5' 
            : 'p-1'
      } rounded-md transition-colors 
        ${day.isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
      `}
    >
      <span className={`${
        isMobile 
          ? 'text-[8px]' 
          : useCompactView 
            ? 'text-[10px]' 
            : 'text-xs'
      } font-normal`}>
        {day.weekday}
      </span>
      <span className={`${
        isMobile 
          ? 'text-xs' 
          : useCompactView 
            ? 'text-sm' 
            : 'text-lg'
      } font-semibold ${day.hasTask && !day.isSelected ? 'text-primary' : ''}`}>
        {day.day}
      </span>
      {day.hasTask && !day.isSelected && (
        <span className={`${
          isMobile 
            ? 'w-0.5 h-0.5' 
            : useCompactView 
              ? 'w-0.5 h-0.5' 
              : 'w-1 h-1'
        } rounded-full bg-primary`}></span>
      )}
    </button>
  );
};

export default WeekDay;
