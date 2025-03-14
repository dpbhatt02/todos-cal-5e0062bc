
import React from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import { useTasksContext } from '@/contexts/TasksContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { addDays } from 'date-fns';

interface OverdueTasksSectionProps {
  tasks: TaskProps[];
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  selectedDate: Date;
  sortOption: string;
}

const OverdueTasksSection = ({ 
  tasks, 
  isOpen, 
  onOpenChange, 
  selectedDate,
  sortOption,
}: OverdueTasksSectionProps) => {
  const { 
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    updateTask
  } = useTasksContext();

  // If no overdue tasks, don't render anything
  if (tasks.length === 0) return null;

  const handleRescheduleAll = async (date: Date) => {
    // Update all overdue tasks to the selected date
    for (const task of tasks) {
      try {
        await updateTask(task.id, { dueDate: date });
      } catch (error) {
        console.error(`Error rescheduling task ${task.id}:`, error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => onOpenChange(!isOpen)}
          className="flex items-center text-destructive font-semibold hover:text-destructive/80 transition-colors"
        >
          {isOpen ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
          Overdue Tasks ({tasks.length})
        </button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium flex items-center gap-1 h-7 px-2 text-destructive hover:text-destructive/80"
            >
              <Calendar className="h-3.5 w-3.5" />
              Reschedule
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleRescheduleAll(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleRescheduleAll(addDays(new Date(), 1))}
              >
                Tomorrow
              </Button>
              <div className="pt-2 border-t mt-1">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleRescheduleAll(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {isOpen && (
        <div className="space-y-1.5 sm:space-y-2 mt-2 pl-5 border-l-2 border-destructive/30">
          {tasks.map(task => (
            <div 
              key={task.id}
              draggable={sortOption === 'custom'}
              onDragStart={(e) => sortOption === 'custom' && handleDragStart(e, task.id)}
              onDragOver={(e) => sortOption === 'custom' && handleDragOver(e)}
              onDragLeave={(e) => sortOption === 'custom' && handleDragLeave(e)}
              onDrop={(e) => sortOption === 'custom' && handleDrop(e, task.id)}
              onDragEnd={(e) => sortOption === 'custom' && handleDragEnd(e)}
              className={sortOption === 'custom' ? 'cursor-move' : ''}
            >
              <TaskCard {...task} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverdueTasksSection;
