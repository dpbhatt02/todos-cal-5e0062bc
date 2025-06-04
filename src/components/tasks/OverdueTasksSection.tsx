
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import { scheduleNextOccurrence, convertTo24HourFormat, prepareTimeForInput } from '@/utils/recurring-tasks';
import { useTasksContext } from '@/contexts/TasksContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { addDays } from 'date-fns';

interface OverdueTasksSectionProps {
  tasks: TaskProps[];
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  selectedDate: Date;
  sortOption: string;
}

const OverdueTasksSection = ({ 
  tasks, 
  isOpen, 
  onOpenChange, 
  selectedDate,
  sortOption,
}: OverdueTasksSectionProps) => {
  const {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    updateTask,
    deleteTask,
    syncTaskToCalendar
  } = useTasksContext();

  const [editingTask, setEditingTask] = useState<TaskProps | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // If no overdue tasks, don't render anything
  if (tasks.length === 0) return null;

  const handleEditTask = (task: TaskProps) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTaskData: any) => {
    if (!editingTask) return;

    const taskUpdates: Partial<TaskProps> = {
      title: updatedTaskData.title,
      description: updatedTaskData.description || '',
      priority: updatedTaskData.priority,
      dueDate: new Date(updatedTaskData.dueDate),
      completed: editingTask.completed,
    };

    if (updatedTaskData.isAllDay !== undefined) {
      taskUpdates.isAllDay = updatedTaskData.isAllDay;
    }

    if (!updatedTaskData.isAllDay && updatedTaskData.startTime) {
      taskUpdates.startTime = convertTo24HourFormat(updatedTaskData.startTime);
      if (updatedTaskData.endTime) {
        taskUpdates.endTime = convertTo24HourFormat(updatedTaskData.endTime);
      }
    } else {
      taskUpdates.startTime = null;
      taskUpdates.endTime = null;
    }

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
      taskUpdates.recurring = undefined;
    }

    await updateTask(editingTask.id, taskUpdates);
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskComplete = async (taskId: string, completed: boolean, completeForever: boolean = false) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.recurring || !completed || completeForever) {
      const updatedTask = await updateTask(taskId, { completed });
      if (updatedTask && updatedTask.googleCalendarEventId) {
        await syncTaskToCalendar(taskId);
      }
      return;
    }

    await updateTask(taskId, { completed: true });
    if (task.googleCalendarEventId) {
      await syncTaskToCalendar(taskId);
    }

    const nextTask = await scheduleNextOccurrence(task);
    if (nextTask) {
      const updatedTask = await updateTask(taskId, {
        ...nextTask,
        dueDate: nextTask.dueDate,
        startTime: nextTask.startTime || null,
        endTime: nextTask.endTime || null,
        isAllDay: nextTask.isAllDay !== undefined ? nextTask.isAllDay : true,
        completed: false
      });
      if (updatedTask && updatedTask.googleCalendarEventId) {
        await syncTaskToCalendar(taskId);
      }
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      if (editingTask && editingTask.id === taskId) {
        setIsEditModalOpen(false);
        setEditingTask(null);
      }
    }
  };

  const handleTaskReschedule = async (taskId: string, newDate: Date) => {
    const updatedTask = await updateTask(taskId, { dueDate: newDate });
    if (updatedTask && updatedTask.googleCalendarEventId) {
      await syncTaskToCalendar(taskId);
    }
  };

  const handleRescheduleAll = async (date: Date) => {
    // Update all overdue tasks to the selected date
    for (const task of tasks) {
      try {
        await updateTask(task.id, { dueDate: date });
      } catch (error) {
        console.error(`Error rescheduling task ${task.id}:`, error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => onOpenChange(!isOpen)}
          className="flex items-center text-destructive font-semibold hover:text-destructive/80 transition-colors"
        >
          {isOpen ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
          Overdue Tasks ({tasks.length})
        </button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium flex items-center gap-1 h-7 px-2 text-destructive hover:text-destructive/80"
            >
              <Calendar className="h-3.5 w-3.5" />
              Reschedule
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-2 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleRescheduleAll(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleRescheduleAll(addDays(new Date(), 1))}
              >
                Tomorrow
              </Button>
              <div className="pt-2 border-t mt-1">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleRescheduleAll(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {isOpen && (
        <div className="space-y-1.5 sm:space-y-2 mt-2 pl-5 border-l-2 border-destructive/30">
          {tasks.map(task => (
            <div 
              key={task.id}
              draggable={sortOption === 'custom'}
              onDragStart={(e) => sortOption === 'custom' && handleDragStart(e, task.id)}
              onDragOver={(e) => sortOption === 'custom' && handleDragOver(e)}
              onDragLeave={(e) => sortOption === 'custom' && handleDragLeave(e)}
              onDrop={(e) => sortOption === 'custom' && handleDrop(e, task.id)}
              onDragEnd={(e) => sortOption === 'custom' && handleDragEnd(e)}
              className={sortOption === 'custom' ? 'cursor-move' : ''}
            >
              <TaskCard
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={handleTaskDelete}
                onReschedule={handleTaskReschedule}
                onComplete={handleTaskComplete}
              />
            </div>
          ))}
        </div>
      )}

      {editingTask && (
        <CreateTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskUpdate}
          editMode
          initialData={{
            ...editingTask,
            dueDate: new Date(editingTask.dueDate).toISOString().split('T')[0],
            startTime: prepareTimeForInput(editingTask.startTime),
            endTime: prepareTimeForInput(editingTask.endTime),
            isAllDay: editingTask.isAllDay !== undefined ? editingTask.isAllDay : true,
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

export default OverdueTasksSection;
