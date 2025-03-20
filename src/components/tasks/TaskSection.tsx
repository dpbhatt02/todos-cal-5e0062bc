import React from 'react';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import { useTasksContext } from '@/contexts/TasksContext';
import { useState } from 'react';
import CreateTaskModal from './CreateTaskModal';
import { scheduleNextOccurrence, convertTo24HourFormat, prepareTimeForInput } from '@/utils/recurring-tasks';

interface TaskSectionProps {
  title: string;
  tasks: TaskProps[];
  sortOption: string;
  selectedDate: Date;
}

const TaskSection = ({ title, tasks, sortOption, selectedDate }: TaskSectionProps) => {
  const { 
    updateTask, 
    deleteTask, 
    handleDragStart, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop, 
    handleDragEnd 
  } = useTasksContext();
  
  const [editingTask, setEditingTask] = useState<TaskProps | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (tasks.length === 0) {
    return null;
  }

  const handleEditTask = (task: TaskProps) => {
    console.log("Edit task requested for:", task.id);
    console.log("Task data for editing:", task); // Log full task data to see recurring fields
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTaskData: any) => {
    if (!editingTask) return;
    
    console.log("Original task data:", editingTask);
    console.log("Form submitted data:", updatedTaskData);
    
    // Prepare the data for the updateTask function
    const taskUpdates: Partial<TaskProps> = {
      title: updatedTaskData.title,
      description: updatedTaskData.description || '',
      priority: updatedTaskData.priority,
      dueDate: new Date(updatedTaskData.dueDate),
      completed: editingTask.completed, // Preserve completion status
    };

    // Add time information if present
    if (updatedTaskData.isAllDay !== undefined) {
      taskUpdates.isAllDay = updatedTaskData.isAllDay;
    }
    
    if (!updatedTaskData.isAllDay && updatedTaskData.startTime) {
      // Fix the time format - ensure it's in 24-hour format (HH:MM)
      taskUpdates.startTime = convertTo24HourFormat(updatedTaskData.startTime);
      
      if (updatedTaskData.endTime) {
        taskUpdates.endTime = convertTo24HourFormat(updatedTaskData.endTime);
      }
    }

    // Handle recurring settings
    if (updatedTaskData.recurring && updatedTaskData.recurring !== 'none') {
      taskUpdates.recurring = {
        frequency: updatedTaskData.recurring as 'daily' | 'weekly' | 'monthly' | 'custom',
        customDays: updatedTaskData.selectedWeekdays || []
      };

      if (updatedTaskData.recurrenceEndType === 'date' && updatedTaskData.recurrenceEndDate) {
        taskUpdates.recurring.endDate = new Date(updatedTaskData.recurrenceEndDate);
      } else if (updatedTaskData.recurrenceEndType === 'after' && updatedTaskData.recurrenceCount) {
        taskUpdates.recurring.endAfter = updatedTaskData.recurrenceCount;
      }
      
      console.log("Setting recurring with:", taskUpdates.recurring);
    } else {
      // If recurring is set to none, remove recurring settings
      taskUpdates.recurring = undefined;
      console.log("Removing recurring settings (set to none)");
    }

    console.log("Updating task with data:", taskUpdates);
    await updateTask(editingTask.id, taskUpdates);
    
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskComplete = async (taskId: string, completed: boolean, completeForever: boolean = false) => {
    console.log("Complete task requested for:", taskId, "completed:", completed, "completeForever:", completeForever);
    
    // Find the task in the tasks array
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    // If it's not a recurring task or we're unchecking or completing forever, just update normally
    if (!task.recurring || !completed || completeForever) {
      await updateTask(taskId, { completed });
      return;
    }
    
    // For recurring tasks being completed (but not forever), we need to:
    // 1. Mark the current occurrence as completed
    // 2. Schedule the next occurrence
    
    // First, mark current as completed
    await updateTask(taskId, { completed: true });
    
    // Then schedule next occurrence
    const nextTask = await scheduleNextOccurrence(task);
    if (nextTask) {
      console.log('Creating next occurrence for task:', taskId);
      // Ensure we explicitly pass all time-related fields when updating
      await updateTask(taskId, {
        ...nextTask,
        dueDate: nextTask.dueDate,
        startTime: nextTask.startTime || null,
        endTime: nextTask.endTime || null,
        isAllDay: nextTask.isAllDay,
        completed: false
      });
    } else {
      console.log('No more occurrences for recurring task:', taskId);
      // This was the last occurrence, nothing more to do
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    console.log("Delete task requested for:", taskId);
    // Use await to ensure the delete operation completes
    const success = await deleteTask(taskId);
    
    if (success) {
      console.log("Task deleted successfully, UI will update via real-time subscription");
      // Close edit modal if the deleted task was being edited
      if (editingTask && editingTask.id === taskId) {
        setIsEditModalOpen(false);
        setEditingTask(null);
      }
    } else {
      console.error("Failed to delete task:", taskId);
    }
  };

  const handleTaskReschedule = async (taskId: string, newDate: Date) => {
    console.log("Reschedule task requested for:", taskId, "to date:", newDate);
    await updateTask(taskId, { dueDate: newDate });
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{title}</h2>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable={sortOption === 'custom'}
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e, task.id)}
            onDragEnd={handleDragEnd}
          >
            <TaskCard
              task={task}
              onEdit={handleEditTask}
              onDelete={handleTaskDelete}
              onComplete={handleTaskComplete}
              onReschedule={handleTaskReschedule}
            />
          </div>
        ))}
      </div>
      
      {/* Edit Task Modal */}
      {editingTask && (
        <CreateTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskUpdate}
          editMode={true}
          initialData={{
            ...editingTask,
            dueDate: new Date(editingTask.dueDate).toISOString().split('T')[0],
            // Convert time values to proper 24-hour format for the input field
            startTime: prepareTimeForInput(editingTask.startTime),
            endTime: prepareTimeForInput(editingTask.endTime),
            isAllDay: editingTask.isAllDay !== undefined ? editingTask.isAllDay : true,
            // Format recurring data for the form
            recurring: editingTask.recurring?.frequency || 'none',
            selectedWeekdays: editingTask.recurring?.customDays || [],
            recurrenceEndType: editingTask.recurring?.endDate 
              ? 'date' 
              : editingTask.recurring?.endAfter 
                ? 'after' 
                : 'never',
            recurrenceEndDate: editingTask.recurring?.endDate 
              ? new Date(editingTask.recurring.endDate).toISOString().split('T')[0]
              : '',
            recurrenceCount: editingTask.recurring?.endAfter || 5,
          }}
        />
      )}
    </div>
  );
};

export default TaskSection;
