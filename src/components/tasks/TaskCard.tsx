
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
import { useTasksContext } from '@/contexts/TasksContext';

interface TaskCardProps extends TaskProps {
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
  recurring,
  onClick
}: TaskCardProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { updateTask, deleteTask } = useTasksContext();

  // Create a task object for reuse
  const task = {
    id,
    title,
    description,
    priority,
    dueDate,
    completed: isCompleted,
    tags,
    recurring
  };

  const handleCheckboxChange = async (checked: boolean | string) => {
    // Convert checked to boolean (in case it comes as string)
    const isChecked = checked === true || checked === 'true';
    setIsCompleted(isChecked);
    
    // Update task completion status in the database
    await updateTask(id, { completed: isChecked });
  };

  const handleEdit = (taskToEdit: TaskProps) => {
    // Open the modal with the task data for editing
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleReschedule = async (taskId: string, newDate: Date) => {
    setSelectedDate(newDate);
    await updateTask(taskId, { dueDate: newDate });
  };

  const handleSwipeLeft = () => {
    // Toggle completion status on swipe left
    handleCheckboxChange(!isCompleted);
  };

  const handleSwipeRight = () => {
    console.log("Swipe right detected for task:", id);
    // On swipe right, open details sheet
    setIsModalOpen(true);
  };

  const { handlers, state, elementRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 40,
  });

  const handleOpenModal = () => {
    console.log("Opening modal for task:", id);
    setIsModalOpen(true);
    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReschedule={(date) => date && handleReschedule(id, date)}
            isMobile={isMobile}
          />
        </div>
      </div>

      <TaskDetailsSheet 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={{
          ...task,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onReschedule: (id, newDate) => handleReschedule(id, newDate)
        }}
      />
    </>
  );
};

export default TaskCard;
