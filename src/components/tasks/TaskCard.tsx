
import { useState } from 'react';
import { Check, Clock, Tag, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent 
} from '@/components/ui/hover-card';

export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | string;
  completed: boolean;
  tags?: string[];
  onClick?: () => void;
}

const TaskCard = ({ 
  id, 
  title, 
  description, 
  priority, 
  dueDate, 
  completed, 
  tags = [],
  onClick
}: TaskProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleted(!isCompleted);
    // In a real app, you would trigger API calls here
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Edit task:', id);
    // In a real app, this would open edit form
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete task:', id);
    // In a real app, this would show confirmation and delete
  };

  return (
    <div 
      className={cn(
        "w-full border border-border/40 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer",
        isCompleted && "opacity-70 bg-muted/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div 
          className="mt-0.5" 
          onClick={handleCheckboxChange}
        >
          <Checkbox 
            checked={isCompleted} 
            className={cn(isCompleted && "opacity-50")}
          />
        </div>
        
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

        <div className={`flex gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="text-muted-foreground hover:text-green-500 transition-colors p-1 rounded-full hover:bg-green-100/20"
            aria-label="Mark as completed"
            onClick={handleCheckboxChange}
          >
            <Check className="h-4 w-4" />
          </button>
          <button 
            className="text-muted-foreground hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-100/20"
            aria-label="Edit task"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100/20"
            aria-label="Delete task"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
