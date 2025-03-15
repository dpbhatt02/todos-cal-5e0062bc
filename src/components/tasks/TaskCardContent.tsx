
import { Clock, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskProps } from './types';
import { formatDate, getRecurringLabel } from './utils';
import TaskTags from './TaskTags';
import { useIsMobile } from '@/hooks/use-mobile';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

interface TaskCardContentProps {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | string;
  startTime?: string;
  endTime?: string;
  tags?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    endDate?: Date | string;
    endAfter?: number;
    customDays?: string[];
  };
  isCompleted: boolean;
  isMobile: boolean;
}

const TaskCardContent = ({
  title,
  description,
  priority,
  dueDate,
  startTime,
  endTime,
  tags = [],
  recurring,
  isCompleted,
  isMobile
}: TaskCardContentProps) => {
  const priorityClasses = {
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high'
  };

  // Format the time display
  const getTimeDisplay = () => {
    if (!startTime) return null;
    
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };

  const timeDisplay = getTimeDisplay();

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center mb-1">
        <h3 className={cn(
          "font-medium truncate mr-2",
          isMobile ? "text-xs" : "text-sm",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {title}
        </h3>
        <div className={cn(
          isMobile ? "h-1.5 w-1.5" : "h-2 w-2",
          "rounded-full flex-shrink-0", 
          priorityClasses[priority]
        )} />
      </div>
      
      {description && !isMobile && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <p className="text-xs text-muted-foreground truncate mb-1 cursor-help">
              {description.substring(0, 60)}
              {description.length > 60 && '...'}
            </p>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <p className="text-sm">{description}</p>
          </HoverCardContent>
        </HoverCard>
      )}
      
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
        <div className="flex items-center text-muted-foreground" style={{fontSize: isMobile ? '0.65rem' : '0.75rem'}}>
          <Clock className={isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"} />
          <span>
            {formatDate(dueDate)}
            {timeDisplay && <span className="ml-1 font-medium">{timeDisplay}</span>}
          </span>
        </div>
        
        {recurring && (
          <div className="flex items-center text-muted-foreground" style={{fontSize: isMobile ? '0.65rem' : '0.75rem'}}>
            <RefreshCcw className={isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"} />
            <span>{getRecurringLabel(recurring.frequency)}</span>
          </div>
        )}
        
        <TaskTags tags={tags} />
      </div>
    </div>
  );
};

export default TaskCardContent;
