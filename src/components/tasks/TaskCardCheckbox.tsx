import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { TaskProps } from './types';
import RecurringTaskCompletionDialog from './RecurringTaskCompletionDialog';

interface TaskCardCheckboxProps {
  task: TaskProps;
  isCompleted: boolean;
  onChange: (checked: boolean, completeForever?: boolean) => void;
  isMobile: boolean;
}

const TaskCardCheckbox = ({ task, isCompleted, onChange, isMobile }: TaskCardCheckboxProps) => {
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  
  const handleCheckboxChange = (checked: boolean) => {
    // If unchecking, just call onChange directly
    if (!checked) {
      onChange(checked);
      return;
    }
    
    // If it's a recurring task and being marked as completed, show the dialog
    if (task.recurring && !isCompleted) {
      setShowRecurringDialog(true);
    } else {
      // Otherwise, just call onChange directly
      onChange(checked);
    }
  };
  
  const handleCompleteOnce = () => {
    onChange(true, false); // Complete this occurrence only
    setShowRecurringDialog(false);
  };
  
  const handleCompleteForever = () => {
    onChange(true, true); // Complete forever
    setShowRecurringDialog(false);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox 
        checked={isCompleted} 
        onCheckedChange={handleCheckboxChange}
        className={cn(
          isMobile ? "h-3.5 w-3.5" : "",
          isCompleted && "opacity-50"
        )}
      />
      
      {/* Dialog for recurring task completion */}
      <RecurringTaskCompletionDialog
        isOpen={showRecurringDialog}
        onClose={() => setShowRecurringDialog(false)}
        onCompleteOnce={handleCompleteOnce}
        onCompleteForever={handleCompleteForever}
        taskTitle={task.title}
      />
    </div>
  );
};

export default TaskCardCheckbox;
