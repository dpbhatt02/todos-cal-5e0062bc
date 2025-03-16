
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import TaskTags from './TaskTags';
import { TaskProps } from './types';

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

  return (
    <div className="flex-1 min-w-0">
      <h3 
        className={cn(
          'font-medium text-lg mb-1 truncate', 
          isCompleted && 'line-through text-muted-foreground'
        )}
      >
        {task.title}
      </h3>
      
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
        
        {task.startTime && (
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{new Date(task.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        )}
        
        {task.recurring && (
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
              {getRecurringLabel(task.recurring.frequency)}
            </span>
          </div>
        )}
        
        {!isMobile && task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <TaskTags tags={task.tags} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCardContent;
