
import React from 'react';
import { TaskProps } from './types';
import { format } from 'date-fns';
import { Check, Calendar } from 'lucide-react';

interface TaskCardContentProps {
  task: TaskProps;
  onClick?: () => void;
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

const TaskCardContent: React.FC<TaskCardContentProps> = ({ task, onClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = typeof task.dueDate === 'string' 
    ? new Date(task.dueDate) 
    : task.dueDate;
  
  const isPastDue = dueDate < today && !task.completed;
  
  return (
    <div 
      className="flex items-start gap-3 px-4 py-3 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${getPriorityClasses(task.priority)}`} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-medium text-base truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          {task.googleCalendarEventId && (
            <span className="flex-shrink-0 text-primary/70">
              <Calendar className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        
        {task.description && (
          <p className={`text-sm mt-1 line-clamp-2 ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className={`text-xs ${isPastDue ? 'text-destructive' : 'text-muted-foreground'}`}>
            {format(dueDate, 'MMM d')}
            {task.startTime && `, ${format(new Date(task.startTime), 'h:mm a')}`}
          </div>
          
          {task.completed && (
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
