
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TaskCardCheckboxProps {
  isCompleted: boolean;
  onChange: (checked: boolean) => void;
  isMobile: boolean;
}

const TaskCardCheckbox = ({ isCompleted, onChange, isMobile }: TaskCardCheckboxProps) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox 
        checked={isCompleted} 
        onCheckedChange={onChange}
        className={cn(
          isMobile ? "h-3.5 w-3.5" : "",
          isCompleted && "opacity-50"
        )}
      />
    </div>
  );
};

export default TaskCardCheckbox;
