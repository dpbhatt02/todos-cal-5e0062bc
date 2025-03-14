
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';

interface WeekNavigatorProps {
  currentDate: Date;
  selectedDate: Date;
  isMobile: boolean;
  useCompactView: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onSelectDay: (date: Date) => void;
}

const WeekNavigator = ({
  currentDate,
  selectedDate,
  isMobile,
  useCompactView,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onSelectDay
}: WeekNavigatorProps) => {
  return (
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
  );
};

export default WeekNavigator;
