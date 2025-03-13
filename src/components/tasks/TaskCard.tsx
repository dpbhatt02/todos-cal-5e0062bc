
import { useState } from 'react';
import { Check, Clock, Tag, ArrowRight, RefreshCcw, Pencil, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent 
} from '@/components/ui/hover-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | string;
  completed: boolean;
  tags?: string[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    endDate?: Date | string;
    endAfter?: number;
    customDays?: string[];
  };
  onEdit?: (task: TaskProps) => void;
  onDelete?: (id: string) => void;
  onReschedule?: (id: string, newDate: Date) => void;
}

const TaskCard = ({ 
  id, 
  title, 
  description, 
  priority, 
  dueDate, 
  completed, 
  tags = [],
  recurring,
  onEdit,
  onDelete,
  onReschedule
}: TaskProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  );

  const priorityClasses = {
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high'
  };

  const tagColors: Record<string, string> = {
    work: 'bg-blue-500',
    personal: 'bg-purple-500',
    health: 'bg-green-500',
    learning: 'bg-amber-500'
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCheckboxChange = () => {
    setIsCompleted(!isCompleted);
    // In a real app, you would trigger API calls here
  };

  const getRecurringLabel = () => {
    if (!recurring) return '';
    
    switch (recurring.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'custom':
        return 'Custom';
      default:
        return '';
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit({
        id,
        title,
        description,
        priority,
        dueDate,
        completed: isCompleted,
        tags,
        recurring
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleReschedule = (date: Date | undefined) => {
    if (date && onReschedule) {
      onReschedule(id, date);
      setSelectedDate(date);
    }
  };

  return (
    <div 
      className={cn(
        "w-full border border-border/40 rounded-lg p-4 transition-all hover:shadow-md relative group",
        isCompleted && "opacity-70 bg-muted/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isCompleted} 
          onCheckedChange={handleCheckboxChange}
          className={cn("mt-0.5", isCompleted && "opacity-50")}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1.5">
            <h3 className={cn(
              "text-base font-medium truncate mr-2",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {title}
            </h3>
            <div className={cn(
              "h-2 w-2 rounded-full flex-shrink-0", 
              priorityClasses[priority]
            )} />
          </div>
          
          {description && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <p className="text-sm text-muted-foreground truncate mb-2 cursor-help">
                  {description.substring(0, 60)}
                  {description.length > 60 && '...'}
                </p>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{description}</p>
              </HoverCardContent>
            </HoverCard>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(dueDate)}</span>
            </div>
            
            {recurring && (
              <div className="flex items-center text-xs text-muted-foreground">
                <RefreshCcw className="h-3 w-3 mr-1" />
                <span>{getRecurringLabel()}</span>
              </div>
            )}
            
            {tags.length > 0 && tags.slice(0, 2).map((tag) => (
              <div 
                key={tag}
                className="flex items-center text-xs px-1.5 py-0.5 rounded-full"
              >
                <span 
                  className={cn("h-2 w-2 rounded-full mr-1", tagColors[tag] || "bg-gray-400")}
                />
                <span>{tag}</span>
              </div>
            ))}
            
            {tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 2} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {isHovered && (
            <div className="flex items-center space-x-1 mr-2 animate-in fade-in">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                aria-label="Edit task"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4" />
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    aria-label="Reschedule task"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleReschedule}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <button 
                className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded-md hover:bg-muted"
                aria-label="Delete task"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <button 
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View task"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
