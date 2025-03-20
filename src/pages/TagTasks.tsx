
import { useState } from 'react';
import TagTaskListWrapper from '@/components/tasks/TagTaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTasksContext } from '@/contexts/TasksContext';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

const TagTasks = () => {
  const isMobile = useIsMobile();
  const [syncing, setSyncing] = useState(false);
  const { synchronizeWithCalendar, isCalendarConnected } = useTasksContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Handler for creating a new task
  const handleCreateTask = (date?: Date) => {
    setSelectedDate(date); // Store the selected date
    setIsCreateModalOpen(true);
  };

  // Handler for submitting a new task
  const handleTaskSubmit = (taskData: any) => {
    console.log('Create task with data:', taskData);
    setIsCreateModalOpen(false);
    // Implement actual task creation logic here
  };

  // Handler for syncing with calendar
  const handleSyncCalendar = async () => {
    if (!isCalendarConnected) return;
    
    setSyncing(true);
    try {
      await synchronizeWithCalendar();
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`container ${isMobile ? 'px-2 sm:px-4' : 'py-6'}`}>
      <TagTaskListWrapper 
        onCreateTask={handleCreateTask}
        onSyncCalendar={handleSyncCalendar}
        syncing={syncing}
        isCalendarConnected={isCalendarConnected}
      />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialData={selectedDate ? { dueDate: formatDate(selectedDate) } : {}}
      />
    </div>
  );
};

// Helper function to format date to YYYY-MM-DD
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default TagTasks;
