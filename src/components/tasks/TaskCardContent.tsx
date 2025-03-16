
import React from 'react';
import { TaskProps } from './types';
import { format } from 'date-fns';
import { Check, Calendar } from 'lucide-react';

interface TaskCardContentProps {
  task: TaskProps;
  onClick?: () => void;
  // Add these separate props that were causing errors
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string | Date;
  startTime?: string;
  endTime?: string;
  tags?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    customDays?: string[];
    endDate?: Date;
    endAfter?: number;
  };
  isCompleted?: boolean;
  isMobile?: boolean;
}

const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-priority-high';
    case 'medium':
      return 'bg-priority-medium';
    case 'low':
      return 'bg-priority-low';
    default:
      return 'bg-priority-medium';
  }
};

const TaskCardContent: React.FC<TaskCardContentProps> = ({ 
  task, 
  onClick, 
  // Support both ways of providing props
  title, 
  description, 
  priority, 
  dueDate, 
  startTime, 
  endTime,
  isCompleted
}) => {
  // Use either the separate props or the task object properties
  const taskTitle = title || task?.title;
  const taskDescription = description || task?.description;
  const taskPriority = priority || task?.priority;
  const taskDueDate = dueDate || task?.dueDate;
  const taskStartTime = startTime || task?.startTime;
  const taskCompleted = isCompleted !== undefined ? isCompleted : task?.completed;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDateObj = typeof taskDueDate === 'string' 
    ? new Date(taskDueDate) 
    : taskDueDate;
  
  const isPastDue = dueDateObj < today && !taskCompleted;
  
  return (
    <div 
      className="flex items-start gap-3 px-4 py-3 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${getPriorityClasses(taskPriority)}`} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-medium text-base truncate ${taskCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {taskTitle}
          </h3>
          {task?.googleCalendarEventId && (
            <span className="flex-shrink-0 text-primary/70">
              <Calendar className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        
        {taskDescription && (
          <p className={`text-sm mt-1 line-clamp-2 ${taskCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
            {taskDescription}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className={`text-xs ${isPastDue ? 'text-destructive' : 'text-muted-foreground'}`}>
            {format(dueDateObj, 'MMM d')}
            {taskStartTime && `, ${format(new Date(taskStartTime), 'h:mm a')}`}
          </div>
          
          {taskCompleted && (
            <span className="inline-flex items-center text-xs font-medium text-green-600">
              <Check className="h-3 w-3 mr-1" />
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCardContent;
