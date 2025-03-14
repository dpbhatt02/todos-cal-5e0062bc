
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TaskProps } from './types';
import TaskActions from './TaskActions';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskCardActionsProps {
  id: string;
  task: TaskProps;
  isHovered: boolean;
  selectedDate: Date;
  isCompleted: boolean;
  openModal: () => void;
  onEdit?: TaskProps['onEdit'];
  onDelete?: TaskProps['onDelete'];
  onReschedule: (date: Date | undefined) => void;
  isMobile: boolean;
}

const TaskCardActions = ({
  id,
  task,
  isHovered,
  selectedDate,
  isCompleted,
  openModal,
  onEdit,
  onDelete,
  onReschedule,
  isMobile
}: TaskCardActionsProps) => {
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    e.preventDefault(); // Prevent other events
    console.log("Edit button clicked for task:", id);
    
    if (onEdit) {
      onEdit(task);
    } else {
      console.log("No onEdit callback provided for task:", id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    e.preventDefault(); // Prevent other events
    console.log("Delete button clicked for task:", id);
    
    if (onDelete) {
      onDelete(id);
    } else {
      console.log("No onDelete callback provided for task:", id);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {isHovered && !isMobile && (
        <div className="flex items-center space-x-1 mr-2 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
          <TaskActions 
            id={id}
            selectedDate={selectedDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReschedule={onReschedule}
          />
        </div>
      )}
      
      <button 
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="View task"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openModal();
        }}
      >
        <ArrowRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
      </button>
    </div>
  );
};

export default TaskCardActions;
