
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import WeekNavigator from './WeekNavigator';
import WeekDaysGrid from './WeekDaysGrid';
import { getWeekDays } from './utils/weekUtils';

interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date;
  tasks: any[]; // Using any[] as we only need to check for tasks on dates
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onSelectDay: (date: Date) => void;
  isCompact?: boolean;
}

const WeekView = ({ 
  currentDate, 
  selectedDate, 
  tasks, 
  onPreviousWeek, 
  onNextWeek, 
  onToday, 
  onSelectDay,
  isCompact
}: WeekViewProps) => {
  const [useCompactView, setUseCompactView] = useState(isCompact);
  const isMobile = useIsMobile();

  // Update compact view based on document class or mobile status
  useEffect(() => {
    if (isCompact === undefined) {
      const isCompactMode = document.documentElement.classList.contains("compact") || isMobile;
      setUseCompactView(isCompactMode);
    } else {
      setUseCompactView(isCompact);
    }
  }, [isCompact, isMobile]);

  // Calculate week days
  const weekDays = getWeekDays(currentDate, selectedDate, tasks, isMobile);

  return (
    <div className={`transition-all duration-200 ${useCompactView ? 'mb-1' : 'mb-4'}`}>
      <WeekNavigator
        currentDate={currentDate}
        selectedDate={selectedDate}
        isMobile={isMobile}
        useCompactView={useCompactView}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
        onToday={onToday}
        onSelectDay={onSelectDay}
      />
      
      <WeekDaysGrid
        weekDays={weekDays}
        isMobile={isMobile}
        useCompactView={useCompactView}
        onSelectDay={onSelectDay}
      />
    </div>
  );
};

export default WeekView;
