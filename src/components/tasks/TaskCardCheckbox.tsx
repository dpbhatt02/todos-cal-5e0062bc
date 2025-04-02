
import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TaskProps } from './types';
import { useTasksContext } from '@/contexts/TasksContext';

interface TaskCardCheckboxProps {
  task: TaskProps;
  isCompleted: boolean;
  onChange: (completed: boolean, completeForever?: boolean) => void;
  isMobile: boolean;
}

const TaskCardCheckbox = ({
  task,
  isCompleted,
  onChange,
  isMobile
}: TaskCardCheckboxProps) => {
  // Local state to immediately reflect UI changes before the network call completes
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { syncTaskToCalendar } = useTasksContext();
  
  const handleChange = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering card click
    
    // Immediately update local state for responsive UI
    const newCompletedState = !localCompleted;
    setLocalCompleted(newCompletedState);
    
    // Call the parent handler (which will persist the change)
    onChange(newCompletedState);
    
    // If the task has a calendar event, sync the change
    if (task.googleCalendarEventId) {
      syncTaskToCalendar(task.id);
    }
  };
  
  const handleCompleteForever = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering card click
    
    // Immediately update local state
    setLocalCompleted(true);
    
    // Call the parent handler with completeForever=true
    onChange(true, true);
    
    // If the task has a calendar event, sync the change
    if (task.googleCalendarEventId) {
      syncTaskToCalendar(task.id);
    }
  };

  // Use either the local state or the prop (if it changes from parent)
  // This ensures we show prop changes but also have immediate UI feedback
  React.useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  // Check if this is a recurring task
  const isRecurring = task.recurring && task.recurring.frequency;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {isRecurring && !isCompleted ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                localCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-input hover:border-primary hover:bg-muted/30'
              )}
              aria-label={localCompleted ? "Mark as not completed" : "Mark as completed"}
            >
              {localCompleted && <Check className={isMobile ? "h-3 w-3" : "h-4 w-4"} />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={handleChange}
              >
                Complete this occurrence
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={handleCompleteForever}
              >
                Complete all occurrences
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <button
          className={cn(
            'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
            localCompleted
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-input hover:border-primary hover:bg-muted/30'
          )}
          onClick={handleChange}
          aria-label={localCompleted ? "Mark as not completed" : "Mark as completed"}
        >
          {localCompleted && <Check className={isMobile ? "h-3 w-3" : "h-4 w-4"} />}
        </button>
      )}
    </div>
  );
};

export default TaskCardCheckbox;
