
import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useTasksContext } from '@/contexts/TasksContext';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Plus } from 'lucide-react';
import { TaskProps } from '@/components/tasks/types';

const Tasks = () => {
  const isMobile = useIsMobile();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { createTask } = useTasksContext();

  const handleCreateTask = async (taskData: any) => {
    // Convert the data to the format expected by the createTask function
    const formattedData: Partial<TaskProps> = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority,
      dueDate: new Date(taskData.dueDate),
      completed: false,
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

    await createTask(formattedData as Omit<TaskProps, 'id'>);
  };

  return (
    <div className={`container ${isMobile ? 'px-2 sm:px-4' : 'py-6'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <ButtonCustom
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Task
        </ButtonCustom>
      </div>
      <TaskList />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;
