
import { useState } from 'react';
import { Check, Clock, ArrowRight, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent 
} from '@/components/ui/hover-card';
import { TaskProps } from './types';
import { formatDate, getRecurringLabel } from './utils';
import TaskActions from './TaskActions';
import TaskTags from './TaskTags';
import TaskDetailsSheet from './TaskDetailsSheet';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const priorityClasses = {
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high'
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    // Convert checked to boolean (in case it comes as string)
    const isChecked = checked === true || checked === 'true';
    setIsCompleted(isChecked);
    // In a real app, you would trigger API calls here
    console.log(`Task ${id} marked as ${isChecked ? 'completed' : 'incomplete'}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleReschedule = (date: Date | undefined) => {
    if (date && onReschedule) {
      setSelectedDate(date);
      onReschedule(id, date);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={cn(
          "w-full border border-border/40 rounded-lg p-2.5 transition-all hover:shadow-md relative group cursor-pointer",
          isCompleted && "opacity-70 bg-muted/30"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenModal}
      >
        <div className="flex items-start gap-2">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5"
          >
            <Checkbox 
              checked={isCompleted} 
              onCheckedChange={handleCheckboxChange}
              className={cn(isCompleted && "opacity-50")}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <h3 className={cn(
                "text-sm font-medium truncate mr-2",
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
            
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(dueDate)}</span>
              </div>
              
              {recurring && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  <span>{getRecurringLabel(recurring.frequency)}</span>
                </div>
              )}
              
              <TaskTags tags={tags} />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {isHovered && (
              <div className="flex items-center space-x-1 mr-2 animate-in fade-in">
                <TaskActions 
                  id={id}
                  selectedDate={selectedDate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReschedule={handleReschedule}
                />
              </div>
            )}
            
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View task"
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <TaskDetailsSheet 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={{
          id,
          title,
          description,
          priority,
          dueDate,
          completed: isCompleted,
          tags,
          recurring,
          onEdit,
          onDelete,
          onReschedule
        }}
      />
    </>
  );
};

export default TaskCard;
