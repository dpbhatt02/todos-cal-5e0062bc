
import React from 'react';
import { Calendar, Clock, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import TaskTags from './TaskTags';
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

  // Format time for display
  const formatTime = (time: string) => {
    try {
      return new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (err) {
      console.error('Error formatting time:', err, time);
      return time;
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
          {task.title}
        </h3>
      </div>
      
      {task.description && (
        <p 
          className={cn(
            'text-sm text-muted-foreground mb-2 line-clamp-2', 
            isCompleted && 'line-through'
          )}
        >
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {task.dueDate && (
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}
        
        {/* Display time duration if available */}
        {task.startTime && (
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatTime(task.startTime)}
              {task.endTime && ` - ${formatTime(task.endTime)}`}
            </span>
          </div>
        )}
        
        {task.recurring && (
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
              {getRecurringLabel(task.recurring.frequency)}
            </span>
          </div>
        )}
        
        {/* Always show tags, but on mobile limit to just a few */}
        {task.tags && task.tags.length > 0 && (
          <div className={`flex items-center gap-1 ${!isMobile ? 'ml-auto' : ''}`}>
            <TaskTags tags={task.tags} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCardContent;
