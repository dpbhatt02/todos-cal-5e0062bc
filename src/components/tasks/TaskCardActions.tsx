
import React from 'react';
import { ArrowRight } from 'lucide-react';
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
  const { updateTask, syncTaskToCalendar } = useTasksContext();
    
  const handleReschedule = async (date: Date | undefined) => {
    if (date) {
      console.log("Rescheduling task", id, "to date:", date);
      try {
        // Actually update the task in the database
        const updatedTask = await updateTask(id, { dueDate: date });
        
        // Trigger sync with Google Calendar if the task has a calendar event
        if (updatedTask && updatedTask.googleCalendarEventId) {
          console.log("Task has Google Calendar event, syncing to calendar...");
          await syncTaskToCalendar(id);
          console.log("Calendar sync completed for task", id);
        } else {
          console.log("Task has no Google Calendar event ID, skipping sync");
        }
        
        // Notify parent component
        onReschedule(date);
      } catch (error) {
        console.error("Error rescheduling task:", error);
      }
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
          onEdit(); // Call onEdit which will trigger the modal to open
        }}
      >
        <ArrowRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
      </button>
    </div>
  );
};

export default TaskCardActions;
