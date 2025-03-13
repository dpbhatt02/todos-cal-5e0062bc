
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskProps } from './types';
import TaskActions from './TaskActions';
import TaskDetailsSheet from './TaskDetailsSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import TaskCardContent from './TaskCardContent';

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
  const isMobile = useIsMobile();

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
          "w-full border border-border/40 rounded-lg transition-all hover:shadow-md relative group cursor-pointer",
          isMobile ? "p-2" : "p-2.5",
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
              className={cn(
                isMobile ? "h-3.5 w-3.5" : "",
                isCompleted && "opacity-50"
              )}
            />
          </div>
          
          <TaskCardContent
            title={title}
            description={description}
            priority={priority}
            dueDate={dueDate}
            tags={tags}
            recurring={recurring}
            isCompleted={isCompleted}
            isMobile={isMobile}
          />

          <div className="flex items-center space-x-1">
            {isHovered && !isMobile && (
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
              <ArrowRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
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
