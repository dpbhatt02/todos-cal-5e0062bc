
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from '@/hooks/use-mobile';

interface WeekDay {
  date: Date;
  day: string;
  weekday: string;
  isToday: boolean;
  isSelected: boolean;
  hasTask: boolean;
}

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
    }
  }, [isCompact, isMobile]);

  const getWeekDays = (): WeekDay[] => {
    const days = [];
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
          const taskDate = new Date(task.dueDate);
          return isSameDay(taskDate, date);
        })
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className={`transition-all duration-200 ${useCompactView ? 'mb-1' : 'mb-4'}`}>
      <div className={`flex justify-between items-center ${useCompactView ? 'mb-1' : 'mb-3'}`}>
        <div className="flex items-center space-x-2">
          {/* Title is hidden in compact mode */}
          {!useCompactView && !isMobile && <h2 className="text-xl font-medium">Upcoming</h2>}
          <Popover>
            <PopoverTrigger asChild>
              <ButtonCustom 
                variant="ghost" 
                className={`flex items-center gap-1 ${
                  isMobile 
                    ? 'text-xs font-medium' 
                    : useCompactView 
                      ? 'text-sm font-medium' 
                      : 'text-md font-semibold'
                }`}
              >
                {isMobile ? format(currentDate, 'MMM yyyy') : format(currentDate, 'MMMM yyyy')}
                <span className="h-4 w-4 ml-1">▼</span>
              </ButtonCustom>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onSelectDay(date);
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <ButtonCustom 
            variant="outline" 
            size="icon" 
            onClick={onPreviousWeek}
            className={isMobile ? "h-5 w-5" : useCompactView ? "h-6 w-6" : "h-7 w-7"}
            aria-label="Previous week"
          >
            <ChevronLeft className={isMobile ? "h-2.5 w-2.5" : useCompactView ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </ButtonCustom>
          
          <ButtonCustom 
            variant="outline" 
            onClick={onToday}
            className={isMobile ? "h-5 text-xs px-1" : useCompactView ? "h-6 text-xs px-1.5" : "h-7 text-xs px-2"}
          >
            Today
          </ButtonCustom>
          
          <ButtonCustom 
            variant="outline" 
            size="icon" 
            onClick={onNextWeek}
            className={isMobile ? "h-5 w-5" : useCompactView ? "h-6 w-6" : "h-7 w-7"}
            aria-label="Next week"
          >
            <ChevronRight className={isMobile ? "h-2.5 w-2.5" : useCompactView ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </ButtonCustom>
        </div>
      </div>
      
      {/* Week day selector - Adjust size based on compact mode */}
      <div className={`grid grid-cols-7 gap-0.5 sm:gap-1 border border-border rounded-lg ${
        isMobile 
          ? 'py-0.5 px-0.5' 
          : useCompactView 
            ? 'py-1 px-0.5' 
            : 'py-2 px-1'
      }`}>
        {weekDays.map((day, index) => (
          <button
            key={index}
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
        ))}
      </div>
    </div>
  );
};

export default WeekView;
