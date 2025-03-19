
import React from 'react';
import { Calendar, Clock, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskProps, priorityClasses } from './types';

export interface TaskCardContentProps {
  task: TaskProps;
  isCompleted: boolean;
  isMobile: boolean;
}

const TaskCardContent = ({ task, isCompleted, isMobile }: TaskCardContentProps) => {
  // Format due date for display
  const formatDueDate = (date: Date | string) => {
    const dueDate = typeof date === 'string' ? new Date(date) : date;
    return format(dueDate, 'MMM d, yyyy');
  };

  // Get recurring frequency label
  const getRecurringLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Every week';
      case 'monthly':
        return 'Every month';
      case 'custom':
        return 'Custom';
      default:
        return '';
    }
  };

  // Format time for display - improved error handling
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      // If the timeString contains a 'T', it's an ISO string
      if (timeString.includes('T')) {
        // Safely parse ISO string
        try {
          const date = parseISO(timeString);
          // Validate if date is valid before formatting
          if (isNaN(date.getTime())) {
            console.warn('Invalid date from ISO string:', timeString);
            return timeString;
          }
          return format(date, 'h:mm a'); // e.g., "9:30 AM"
        } catch (parseError) {
          console.warn('Error parsing ISO time string:', parseError, timeString);
          return timeString;
        }
      } 
      // Otherwise it's just a time string
      else {
        try {
          // Validate time string format (HH:MM)
          if (!/^\d{1,2}:\d{2}$/.test(timeString)) {
            console.warn('Invalid time string format:', timeString);
            return timeString;
          }
          
          const [hours, minutes] = timeString.split(':').map(Number);
          
          // Validate hour and minute values
          if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.warn('Invalid hours or minutes:', hours, minutes);
            return timeString;
          }
          
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return format(date, 'h:mm a');
        } catch (timeError) {
          console.warn('Error processing time string:', timeError, timeString);
          return timeString;
        }
      }
    } catch (err) {
      console.error('Error formatting time:', err, timeString);
      return timeString;
    }
  };

  // Priority display
  const getPriorityClass = (priority: string | undefined) => {
    if (!priority) return "";
    return priorityClasses[priority] || priorityClasses.default;
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        {task.priority && (
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              getPriorityClass(task.priority)
            )}
            title={`Priority: ${task.priority}`}
          />
        )}
        <h3 
          className={cn(
            'font-medium text-lg truncate', 
            isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {isCompleted && !task.title.startsWith('✓ ') ? `✓ ${task.title}` : task.title}
        </h3>
      </div>
      
      {task.description && (
        <p 
          className={cn(
            'text-sm text-muted-foreground mb-2 line-clamp-2', 
            isCompleted && 'line-through opacity-70'
          )}
        >
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {task.dueDate && (
          <div className={cn(
            "flex items-center text-muted-foreground",
            isCompleted && "line-through opacity-70"
          )}>
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}
        
        {/* Display time duration if available and not all-day */}
        {!task.isAllDay && task.startTime && (
          <div className={cn(
            "flex items-center text-muted-foreground",
            isCompleted && "line-through opacity-70"
          )}>
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatTime(task.startTime)}
              {task.endTime && ` - ${formatTime(task.endTime)}`}
            </span>
          </div>
        )}
        
        {/* Show "All day" indicator for all-day tasks */}
        {task.isAllDay && (
          <div className={cn(
            "flex items-center text-muted-foreground",
            isCompleted && "line-through opacity-70"
          )}>
            <Clock className="h-3 w-3 mr-1" />
            <span>All day</span>
          </div>
        )}
        
        {task.recurring && (
          <div className={cn(
            "flex items-center text-xs",
            isCompleted ? "text-blue-400 opacity-70" : "text-blue-600"
          )}>
            <span className={cn(
              "inline-block rounded-full px-2 py-0.5",
              isCompleted ? "bg-blue-50 text-blue-400 line-through" : "bg-blue-100 text-blue-800"
            )}>
              {getRecurringLabel(task.recurring.frequency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCardContent;
