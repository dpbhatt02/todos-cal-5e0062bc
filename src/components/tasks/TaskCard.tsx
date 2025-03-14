import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TaskProps } from './types';
import TaskDetailsSheet from './TaskDetailsSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import TaskCardContent from './TaskCardContent';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import TaskCardCheckbox from './TaskCardCheckbox';
import TaskCardSwipeIndicator from './TaskCardSwipeIndicator';
import TaskCardActions from './TaskCardActions';
import { useTasksContext } from '@/contexts/TasksContext';
import CreateTaskModal from './CreateTaskModal';

interface TaskCardProps extends TaskProps {
  onClick?: () => void;
}

const TaskCard = ({ 
  id, 
  title, 
  description, 
  priority, 
  dueDate, 
  completed,
  startTime,
  endTime,
  tags = [],
  recurring,
  onClick
}: TaskCardProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { updateTask, deleteTask } = useTasksContext();

  // Create a task object for reuse
  const task = {
    id,
    title,
    description,
    priority,
    dueDate,
    completed: isCompleted,
    startTime,
    endTime,
    tags,
    recurring
  };

  const handleCheckboxChange = async (checked: boolean | string) => {
    // Convert checked to boolean (in case it comes as string)
    const isChecked = checked === true || checked === 'true';
    setIsCompleted(isChecked);
    
    // Update task completion status in the database
    await updateTask(id, { completed: isChecked });
  };

  const handleEdit = (taskToEdit: TaskProps) => {
    console.log("Editing task:", taskToEdit);
    // Open the edit modal with the task data for editing
    setIsEditModalOpen(true);
    // Close the details modal if it's open
    setIsDetailsModalOpen(false);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleReschedule = async (taskId: string, newDate: Date) => {
    setSelectedDate(newDate);
    await updateTask(taskId, { dueDate: newDate });
  };

  const handleSwipeLeft = () => {
    // Toggle completion status on swipe left
    handleCheckboxChange(!isCompleted);
  };

  const handleSwipeRight = () => {
    console.log("Swipe right detected for task:", id);
    // On swipe right, open details sheet
    setIsDetailsModalOpen(true);
  };

  const { handlers, state, elementRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 40,
  });

  const handleOpenDetailsModal = () => {
    console.log("Opening details modal for task:", id);
    setIsDetailsModalOpen(true);
    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSubmitEdit = async (taskData: any) => {
    console.log("Submitting edit for task:", id, taskData);
    // Convert the data to the format expected by the updateTask function
    const formattedData: Partial<TaskProps> = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority,
      dueDate: new Date(taskData.dueDate),
      tags: taskData.tags || []
    };

    // Include recurring data if present
    if (taskData.recurring && taskData.recurring !== 'none') {
      formattedData.recurring = {
        frequency: taskData.recurring,
        customDays: taskData.selectedWeekdays || []
      };

      // Add end date or count if specified
      if (taskData.recurrenceEndType === 'date' && taskData.recurrenceEndDate) {
        formattedData.recurring.endDate = new Date(taskData.recurrenceEndDate);
      } else if (taskData.recurrenceEndType === 'after' && taskData.recurrenceCount) {
        formattedData.recurring.endAfter = taskData.recurrenceCount;
      }
    }

    await updateTask(id, formattedData);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div 
        ref={elementRef}
        className={cn(
          "w-full border border-border/40 rounded-lg transition-all hover:shadow-md relative group cursor-pointer overflow-hidden",
          isMobile ? "p-2" : "p-2.5",
          isCompleted && "opacity-70 bg-muted/30"
        )}
        style={isMobile ? {
          transform: `translateX(${state.swipeOffset}px)`,
          transition: state.swiping ? 'none' : 'transform 0.3s ease'
        } : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenDetailsModal}
        {...(isMobile ? handlers : {})}
      >
        <TaskCardSwipeIndicator 
          swiping={state.swiping}
          swipeOffset={state.swipeOffset}
          isCompleted={isCompleted}
          isMobile={isMobile}
        />
        
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <TaskCardCheckbox 
              isCompleted={isCompleted} 
              onChange={handleCheckboxChange}
              isMobile={isMobile}
            />
          </div>
          
          <TaskCardContent
            title={title}
            description={description}
            priority={priority}
            dueDate={dueDate}
            startTime={startTime}
            endTime={endTime}
            tags={tags}
            recurring={recurring}
            isCompleted={isCompleted}
            isMobile={isMobile}
          />

          <TaskCardActions
            id={id}
            task={task}
            isHovered={isHovered}
            selectedDate={selectedDate}
            isCompleted={isCompleted}
            openModal={handleOpenDetailsModal}
            onEdit={(e) => {
              e.stopPropagation();
              handleEdit(task);
            }}
            onDelete={handleDelete}
            onReschedule={(date) => date && handleReschedule(id, date)}
            isMobile={isMobile}
          />
        </div>
      </div>

      <TaskDetailsSheet 
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        task={{
          ...task,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onReschedule: (id, newDate) => handleReschedule(id, newDate)
        }}
      />

      <CreateTaskModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEdit}
        editMode={true}
        initialData={{
          title,
          description: description || '',
          priority,
          dueDate: typeof dueDate === 'string' ? dueDate : dueDate.toISOString().split('T')[0],
          startTime: startTime || '',
          endTime: endTime || '',
          tags: tags || [],
          recurring: recurring?.frequency || 'none',
          selectedWeekdays: recurring?.customDays || [],
          recurrenceEndType: recurring?.endDate ? 'date' : recurring?.endAfter ? 'after' : 'never',
          recurrenceEndDate: recurring?.endDate ? 
            (typeof recurring.endDate === 'string' ? recurring.endDate : recurring.endDate.toISOString().split('T')[0]) : 
            '',
          recurrenceCount: recurring?.endAfter || 5
        }}
      />
    </>
  );
};

export default TaskCard;
