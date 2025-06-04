
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TaskProps } from './types';
import TaskActions from './TaskActions';
import { useTasksContext } from '@/contexts/TasksContext';
import { toast } from 'sonner';

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
    if (!date) return;
    
    console.log("Rescheduling task", id, "to date:", date);
    
    try {
      // Show loading state
      const loadingToast = toast.loading("Rescheduling task...");
      
      // Update the task in the database
      const updatedTask = await updateTask(id, { dueDate: date });
      
      if (updatedTask) {
        // Sync with Google Calendar if the task has a calendar event
        if (updatedTask.googleCalendarEventId) {
          console.log("Task has Google Calendar event, syncing to calendar...");
          const syncSuccess = await syncTaskToCalendar(id);
          
          if (syncSuccess) {
            console.log("Calendar sync completed for task", id);
            toast.success("Task rescheduled and synced to calendar");
          } else {
            console.log("Calendar sync failed for task", id);
            toast.warning("Task rescheduled but calendar sync failed");
          }
        } else {
          console.log("Task has no Google Calendar event ID, skipping sync");
          toast.success("Task rescheduled successfully");
        }
        
        // Notify parent component
        onReschedule(date);
      } else {
        throw new Error("Failed to update task");
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error("Error rescheduling task:", error);
      toast.error("Failed to reschedule task");
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
          onEdit();
        }}
      >
        <ArrowRight className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
      </button>
    </div>
  );
};

export default TaskCardActions;
