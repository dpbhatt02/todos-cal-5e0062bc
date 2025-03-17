
import React from 'react';
import { Pencil, Calendar, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { addDays } from 'date-fns';
import { useTasksContext } from '@/contexts/TasksContext';

interface TaskActionsProps {
  id: string;
  selectedDate: Date;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onReschedule: (date: Date | undefined) => void;
}

const TaskActions = ({ id, selectedDate, onEdit, onDelete, onReschedule }: TaskActionsProps) => {
  const { updateTask } = useTasksContext();
  
  const handleRescheduleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    console.log("Rescheduling to today:", today);
    onReschedule(today);
    
    // Close the popover
    const popoverTrigger = document.querySelector(`[data-trigger-for="${id}"]`) as HTMLButtonElement;
    if (popoverTrigger) {
      popoverTrigger.click(); // Close the popover
    }
  };
  
  const handleRescheduleTomorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tomorrow = addDays(new Date(), 1);
    console.log("Rescheduling to tomorrow:", tomorrow);
    onReschedule(tomorrow);
    
    // Close the popover
    const popoverTrigger = document.querySelector(`[data-trigger-for="${id}"]`) as HTMLButtonElement;
    if (popoverTrigger) {
      popoverTrigger.click(); // Close the popover
    }
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    console.log("Calendar date selected:", date);
    onReschedule(date);
    
    // Close the popover
    const popoverTrigger = document.querySelector(`[data-trigger-for="${id}"]`) as HTMLButtonElement;
    if (popoverTrigger) {
      popoverTrigger.click(); // Close the popover
    }
  };

  return (
    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
      <button 
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        aria-label="Edit task"
        type="button"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </button>
      
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            aria-label="Reschedule task"
            type="button"
            data-trigger-for={id}
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-2 flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleRescheduleToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleRescheduleTomorrow}
            >
              Tomorrow
            </Button>
            <div className="pt-2 border-t mt-1">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <button 
        className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded-md hover:bg-muted"
        aria-label="Delete task"
        type="button"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TaskActions;
