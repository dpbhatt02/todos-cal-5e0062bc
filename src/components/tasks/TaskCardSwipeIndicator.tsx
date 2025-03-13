
import React from 'react';
import { ArrowRight, CheckCircle, RotateCcw, Pencil } from 'lucide-react';

interface TaskCardSwipeIndicatorProps {
  swiping: boolean;
  swipeOffset: number;
  isCompleted: boolean;
  isMobile: boolean;
}

const TaskCardSwipeIndicator = ({
  swiping,
  swipeOffset,
  isCompleted,
  isMobile
}: TaskCardSwipeIndicatorProps) => {
  if (!swiping || !isMobile) return null;
  
  // Determine which indicator to show based on swipe direction
  if (swipeOffset > 0) {
    return (
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 bg-primary/10 text-primary">
        <Pencil className="h-4 w-4" />
      </div>
    );
  } else if (swipeOffset < 0) {
    return (
      <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-primary/10 text-primary">
        {isCompleted ? <RotateCcw className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
      </div>
    );
  }
  
  return null;
};

export default TaskCardSwipeIndicator;
