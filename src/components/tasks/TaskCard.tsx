
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
  const isMobile = useIsMobile();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleReschedule = (newDate: Date) => {
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
  const { bindSwipeGesture } = useSwipeGesture({
    onSwipeStart: () => {},
    onSwipeMove: (event, { deltaX }) => {
      // Determine swipe direction
      setIsSwipingLeft(deltaX < 0);
      setIsSwipingRight(deltaX > 0);
      setSwipePosition(deltaX);
    },
    onSwipeEnd: (event, { deltaX }) => {
      // Handle complete swipe action
      if (deltaX > 100) {
        // Swiped right (complete)
        handleComplete(!task.completed);
      } else if (deltaX < -100) {
        // Swiped left (delete)
        handleDelete();
      }
      
      // Reset swipe state
      setIsSwipingLeft(false);
      setIsSwipingRight(false);
      setSwipePosition(0);
    },
  });

  // Transform style for card when swiping
  const transformStyle = {
    transform: `translateX(${swipePosition}px)`,
    transition: swipePosition === 0 ? 'transform 0.3s ease' : 'none',
  };

  // Determine opacity for swipe indicators
  const leftIndicatorOpacity = Math.min(Math.abs(Math.min(swipePosition, 0)) / 100, 1);
  const rightIndicatorOpacity = Math.min(Math.max(swipePosition, 0) / 100, 1);

  return (
    <div className="relative">
      {/* Swipe indicators - only shown on mobile */}
      {isMobile && (
        <>
          <TaskCardSwipeIndicator 
            position="left"
            opacity={leftIndicatorOpacity}
            icon="delete"
          />
          <TaskCardSwipeIndicator 
            position="right"
            opacity={rightIndicatorOpacity}
            icon="complete"
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
        {...(isMobile ? bindSwipeGesture() : {})}
      >
        <div className="p-4 flex gap-4">
          <TaskCardCheckbox 
            isCompleted={task.completed} 
            priority={task.priority || 'medium'} 
            onChange={(completed) => handleComplete(completed)}
          />

          <TaskCardContent
            task={task}
            isCompleted={task.completed}
            isMobile={isMobile}
          />

          <TaskCardActions
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReschedule={handleReschedule}
          />
        </div>
      </Card>
    </div>
  );
};

export default TaskCard;
