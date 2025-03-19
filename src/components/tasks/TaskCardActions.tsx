
import React from 'react';
import { ArrowRight, Calendar, Trash2 } from 'lucide-react';
import { TaskProps } from './types';
import TaskActions from './TaskActions';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTasksContext } from '@/contexts/TasksContext';

interface TaskCardActionsProps {
  id: string;
  task: TaskProps;
  isHovered: boolean;
  selectedDate: Date;
  isCompleted: boolean;
  openModal: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReschedule: (date: Date) => void;
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
  const { updateTask, deleteTask } = useTasksContext();
    

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    e.preventDefault(); // Prevent other events
    console.log("Edit button clicked for task:", id);//console
    // Call the provided onEdit handler
    onEdit();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    e.preventDefault(); // Prevent other events
    console.log("Delete button clicked for task:", id);
    
    // Actually delete the task from the database
    const success = await deleteTask(id);
    if (success) {
      onDelete(); // Notify parent component after deletion
    }
  };
  
   const handleReschedule = (date: Date | undefined) => {
    if (date) {
      console.log("Rescheduling task", id, "to date:", date);
      // Actually update the task in the database
      updateTask(id, { dueDate: date });
      onReschedule(date);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Always show actions on mobile, but only on hover for desktop */}
      {(isHovered || isMobile) && (
        <div className={`flex items-center space-x-1 mr-2 ${!isMobile ? 'animate-in fade-in' : ''}`} onClick={(e) => e.stopPropagation()}>
          <TaskActions 
            id={id}
            selectedDate={selectedDate}
            onReschedule={handleReschedule}
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
