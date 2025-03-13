
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TaskProps } from './types';
import TaskDetailsSheet from './TaskDetailsSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import TaskCardContent from './TaskCardContent';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import TaskCardCheckbox from './TaskCardCheckbox';
import TaskCardSwipeIndicator from './TaskCardSwipeIndicator';
import TaskCardActions from './TaskCardActions';

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

  // Create a task object for reuse
  const task = {
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
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    // Convert checked to boolean (in case it comes as string)
    const isChecked = checked === true || checked === 'true';
    setIsCompleted(isChecked);
    // In a real app, you would trigger API calls here
    console.log(`Task ${id} marked as ${isChecked ? 'completed' : 'incomplete'}`);
  };

  const handleSwipeLeft = () => {
    // Toggle completion status on swipe left
    handleCheckboxChange(!isCompleted);
  };

  const handleSwipeRight = () => {
    console.log("Swipe right detected for task:", id);
    // On swipe right, invoke the edit function if available
    if (onEdit && isMobile) {
      console.log("Invoking onEdit function for task:", id);
      onEdit(task);
    } else {
      // If not available or not on mobile, fall back to opening details sheet
      console.log("Opening details modal for task:", id);
      setIsModalOpen(true);
    }
  };

  const { handlers, state, elementRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 40,
  });

  const handleOpenModal = () => {
    console.log("Opening modal for task:", id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Fixed the handleReschedule function to correctly pass id and date to onReschedule
  const handleReschedule = (date: Date | undefined) => {
    if (date && onReschedule) {
      setSelectedDate(date);
      onReschedule(id, date);
    }
  };

  return (
    <>
      <div 
        ref={elementRef}
        className={cn(
          "w-full border border-border/40 rounded-lg transition-all hover:shadow-md relative group cursor-pointer overflow-hidden",
          isMobile ? "p-2" : "p-2.5",
          isCompleted && "opacity-70 bg-muted/30"
        )}
        style={isMobile ? {
          transform: `translateX(${state.swipeOffset}px)`,
          transition: state.swiping ? 'none' : 'transform 0.3s ease'
        } : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenModal}
        {...(isMobile ? handlers : {})}
      >
        <TaskCardSwipeIndicator 
          swiping={state.swiping}
          swipeOffset={state.swipeOffset}
          isCompleted={isCompleted}
          isMobile={isMobile}
        />
        
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <TaskCardCheckbox 
              isCompleted={isCompleted} 
              onChange={handleCheckboxChange}
              isMobile={isMobile}
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

          <TaskCardActions
            id={id}
            task={task}
            isHovered={isHovered}
            selectedDate={selectedDate}
            isCompleted={isCompleted}
            openModal={handleOpenModal}
            onEdit={onEdit}
            onDelete={onDelete}
            onReschedule={handleReschedule}
            isMobile={isMobile}
          />
        </div>
      </div>

      <TaskDetailsSheet 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={task}
      />
    </>
  );
};

export default TaskCard;
