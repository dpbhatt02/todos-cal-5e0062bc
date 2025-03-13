
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
}

const WeekView = ({ 
  currentDate, 
  selectedDate, 
  tasks, 
  onPreviousWeek, 
  onNextWeek, 
  onToday, 
  onSelectDay 
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
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-medium">Upcoming</h2>
          <Popover>
            <PopoverTrigger asChild>
              <ButtonCustom variant="ghost" className="flex items-center gap-1 text-md font-semibold">
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
            className="h-7 w-7"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </ButtonCustom>
          
          <ButtonCustom 
            variant="outline" 
            onClick={onToday}
            className="h-7 text-xs px-2"
          >
            Today
          </ButtonCustom>
          
          <ButtonCustom 
            variant="outline" 
            size="icon" 
            onClick={onNextWeek}
            className="h-7 w-7"
            aria-label="Next week"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </ButtonCustom>
        </div>
      </div>
      
      {/* Week day selector - Reduced size */}
      <div className="grid grid-cols-7 gap-1 border border-border rounded-lg py-2 px-1">
        {weekDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onSelectDay(day.date)}
            className={`flex flex-col items-center p-1 rounded-md transition-colors 
              ${day.isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            `}
          >
            <span className="text-xs font-normal">{day.weekday}</span>
            <span className={`text-lg font-semibold ${day.hasTask && !day.isSelected ? 'text-primary' : ''}`}>
              {day.day}
            </span>
            {day.hasTask && !day.isSelected && (
              <span className="w-1 h-1 rounded-full bg-primary"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
