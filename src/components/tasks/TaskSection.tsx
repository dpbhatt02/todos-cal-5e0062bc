
import React from 'react';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import { useTasksContext } from '@/contexts/TasksContext';
import { useState } from 'react';
import CreateTaskModal from './CreateTaskModal';

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
    console.log("Task data for editing:", task); // Log full task data to see time fields
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTaskData: any) => {
    if (!editingTask) return;
    
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
      taskUpdates.startTime = updatedTaskData.startTime;
      if (updatedTaskData.endTime) {
        taskUpdates.endTime = updatedTaskData.endTime;
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
    } else {
      // If recurring is set to none, remove recurring settings
      taskUpdates.recurring = undefined;
    }

    console.log("Updating task with data:", taskUpdates);
    await updateTask(editingTask.id, taskUpdates);
    
    setIsEditModalOpen(false);
    setEditingTask(null);
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

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    console.log("Complete task requested for:", taskId, "completed:", completed);
    await updateTask(taskId, { completed });
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
            startTime: editingTask.startTime || '',
            endTime: editingTask.endTime || '',
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
