
import React from 'react';
import { Pencil, Calendar, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface TaskActionsProps {
  id: string;
  selectedDate: Date;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onReschedule: (date: Date | undefined) => void;
}

const TaskActions = ({ id, selectedDate, onEdit, onDelete, onReschedule }: TaskActionsProps) => {
  return (
    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
      <button 
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        aria-label="Edit task"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(e);
        }}
      >
        <Pencil className="h-4 w-4" />
      </button>
      
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            aria-label="Reschedule task"
            type="button"
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="end">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={onReschedule}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <button 
        className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded-md hover:bg-muted"
        aria-label="Delete task"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(e);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TaskActions;
