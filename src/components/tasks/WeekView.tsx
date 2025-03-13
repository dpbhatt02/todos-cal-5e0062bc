
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";

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
  isCompact = false
}: WeekViewProps) => {
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
        weekday: format(date, 'EEE'),
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
    <div className={`transition-all duration-200 ${isCompact ? 'mb-1' : 'mb-4'}`}>
      <div className={`flex justify-between items-center ${isCompact ? 'mb-1' : 'mb-3'}`}>
        <div className="flex items-center space-x-2">
          {/* Title is hidden in compact mode */}
          {!isCompact && <h2 className="text-xl font-medium">Upcoming</h2>}
          <Popover>
            <PopoverTrigger asChild>
              <ButtonCustom 
                variant="ghost" 
                className={`flex items-center gap-1 ${isCompact ? 'text-sm font-medium' : 'text-md font-semibold'}`}
              >
                {format(currentDate, 'MMMM yyyy')}
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
        
        <div className="flex items-center gap-2">
          <ButtonCustom 
            variant="outline" 
            size="icon" 
            onClick={onPreviousWeek}
            className={isCompact ? "h-6 w-6" : "h-7 w-7"}
            aria-label="Previous week"
          >
            <ChevronLeft className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </ButtonCustom>
          
          <ButtonCustom 
            variant="outline" 
            onClick={onToday}
            className={isCompact ? "h-6 text-xs px-1.5" : "h-7 text-xs px-2"}
          >
            Today
          </ButtonCustom>
          
          <ButtonCustom 
            variant="outline" 
            size="icon" 
            onClick={onNextWeek}
            className={isCompact ? "h-6 w-6" : "h-7 w-7"}
            aria-label="Next week"
          >
            <ChevronRight className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </ButtonCustom>
        </div>
      </div>
      
      {/* Week day selector - Adjust size based on compact mode */}
      <div className={`grid grid-cols-7 gap-1 border border-border rounded-lg ${
        isCompact ? 'py-1 px-0.5' : 'py-2 px-1'
      }`}>
        {weekDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onSelectDay(day.date)}
            className={`flex flex-col items-center ${
              isCompact ? 'p-0.5' : 'p-1'
            } rounded-md transition-colors 
              ${day.isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            `}
          >
            <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-normal`}>
              {day.weekday}
            </span>
            <span className={`${
              isCompact ? 'text-sm' : 'text-lg'
            } font-semibold ${day.hasTask && !day.isSelected ? 'text-primary' : ''}`}>
              {day.day}
            </span>
            {day.hasTask && !day.isSelected && (
              <span className={`${isCompact ? 'w-0.5 h-0.5' : 'w-1 h-1'} rounded-full bg-primary`}></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
