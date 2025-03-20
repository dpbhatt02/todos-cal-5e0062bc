
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TaskProps } from './types';
import TaskCardCheckbox from './TaskCardCheckbox';
import TaskCardContent from './TaskCardContent';
import TaskCardActions from './TaskCardActions';
import TaskCardSwipeIndicator from './TaskCardSwipeIndicator';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTasksContext } from '@/contexts/TasksContext';

interface TaskCardProps {
  task: TaskProps;
  onEdit?: (task: TaskProps) => void;
  onDelete?: (taskId: string) => void;
  onReschedule?: (taskId: string, newDate: Date) => void;
  onComplete?: (taskId: string, completed: boolean, completeForever?: boolean) => void;
}

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onReschedule,
  onComplete,
}: TaskCardProps) => {
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [isSwipingRight, setIsSwipingRight] = useState(false);
  const [swipePosition, setSwipePosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  const handleEdit = () => {
    console.log("Edit handler called for task:", task.id);
    if (onEdit) {
      // Explicitly pass the entire task object to trigger edit modal
      onEdit(task);
      console.log("onEdit handler called with task:", task.id);
    } else {
      console.warn("No onEdit handler provided for task:", task.id);
    }
  };

  const handleDelete = () => {
    console.log("Delete handler called for task:", task.id);
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleReschedule = (newDate: Date) => {
    console.log("Reschedule handler called for task:", task.id, "new date:", newDate);
    if (onReschedule) {
      onReschedule(task.id, newDate);
    }
  };

  const handleComplete = (completed: boolean, completeForever?: boolean) => {
    if (onComplete) {
      onComplete(task.id, completed, completeForever);
    } else {
      // If no callback is provided, this is likely a mock card
      console.log('Task completed:', task.id, completed, completeForever ? 'forever' : 'once');
    }
  };

  // Setup swipe gesture for mobile
  const { handlers, state } = useSwipeGesture({
    onSwipeLeft: () => handleDelete(),
    onSwipeRight: () => handleComplete(!task.completed),
    threshold: 50,
    preventScroll: true
  });

  // Transform style for card when seping
  const transformStyle = {
    transform: `translateX(${swePosition}px)`,
    transition: swePosition === 0 ? 'transform 0.3s ease' : 'none',
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHoved(false)}
    >
      {/* Swipe indicators - only shown on mobile */}
      {isMobile && (
        <>
          <TaskCardswipeIndicator 
            swiping={isSwipingLeft}
            swipeOffset={swipePosition}
            isCompleted={task.completed}
            isMobile={isMobile}
          />
          <TaskCardswipeIndicator 
            swiping={isSwipingRight}
            swipeOffset={swipePosition}
            isCompleted={task.completed}
            isMobile={isMobile}
  />
        </>
  
      )}
      
      {/* Task card */}
      <Card
        className={cn(
          'relative bg-card border overflow-hidden transition-all cursor-pointer',
          task.completed ? 'opacity-70' : 'opacity-100',
          isSwipingLeft || isSwipingRight ? 'shadow-md' : ''
        )}
        style={isMobile ? transformStyle : undefined}
        {...(isMobile ? handlers : {})}
        onClick={handleEdit} // Make the entire card clickable to edit
      >
        <div className="p-4 flex gap-4">
          <TaskCardCheckbox 
            task={task}
            isCompleted={task.completed} 
            onChange={(completed, completeForever) => handleComplete(completed, completeForever)}
            isMobile={isMobile}
          />

          <TaskCardContent
            task={task}
            isCompleted={task.completed}
            isMobile={isMobile}
          />

          <TaskCardActions
            id={task.id}
            task={task}
            isHovered={isHovered}
            selectedDate={new Date(task.dueDate)}
            isCompleted={task.completed}
            openModal={handleEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReschedule={handleReschedule}
            isMobile={isMobile}
          />
        </div>
      </Card>
    </div>
  );
};

export default TaskCard;
