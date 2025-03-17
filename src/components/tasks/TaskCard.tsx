
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

interface TaskCardProps {
  task: TaskProps;
  onEdit?: (task: TaskProps) => void;
  onDelete?: (taskId: string) => void;
  onReschedule?: (taskId: string, newDate: Date) => void;
  onComplete?: (taskId: string, completed: boolean) => void;
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
      onEdit(task);
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

  const handleComplete = (completed: boolean) => {
    if (onComplete) {
      onComplete(task.id, completed);
    } else {
      // If no callback is provided, this is likely a mock card
      console.log('Task completed:', task.id, completed);
    }
  };

  // Setup swipe gesture for mobile
  const { handlers, state } = useSwipeGesture({
    onSwipeLeft: () => handleDelete(),
    onSwipeRight: () => handleComplete(!task.completed),
    threshold: 50,
    preventScroll: true
  });

  // Transform style for card when swiping
  const transformStyle = {
    transform: `translateX(${swipePosition}px)`,
    transition: swipePosition === 0 ? 'transform 0.3s ease' : 'none',
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Swipe indicators - only shown on mobile */}
      {isMobile && (
        <>
          <TaskCardSwipeIndicator 
            swiping={isSwipingLeft}
            swipeOffset={swipePosition}
            isCompleted={task.completed}
            isMobile={isMobile}
          />
          <TaskCardSwipeIndicator 
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
          'relative bg-card border overflow-hidden transition-all',
          task.completed ? 'opacity-70' : 'opacity-100',
          isSwipingLeft || isSwipingRight ? 'shadow-md' : ''
        )}
        style={isMobile ? transformStyle : undefined}
        {...(isMobile ? handlers : {})}
      >
        <div className="p-4 flex gap-4">
          <TaskCardCheckbox 
            isCompleted={task.completed} 
            onChange={(completed) => handleComplete(completed as boolean)}
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
            openModal={() => handleEdit()}
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
