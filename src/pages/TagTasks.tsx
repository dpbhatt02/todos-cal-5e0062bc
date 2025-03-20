
import { useState } from 'react';
import TagTaskListWrapper from '@/components/tasks/TagTaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTasksContext } from '@/contexts/TasksContext';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { format } from 'date-fns';

const TagTasks = () => {
  const isMobile = useIsMobile();
  const [syncing, setSyncing] = useState(false);
  const { synchronizeWithCalendar, isCalendarConnected } = useTasksContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Handler for creating a new task
  const handleCreateTask = (date?: Date) => {
    console.log('Creating task with date:', date);
    if (date) {
      console.log('Date ISO string:', date.toISOString());
      console.log('Formatted date:', formatDate(date));
    }
    setSelectedDate(date); // Store the selected date
    setIsCreateModalOpen(true);
  };

  // Handler for submitting a new task
  const handleTaskSubmit = (taskData: any) => {
    console.log('Create task with data:', taskData);
    setIsCreateModalOpen(false);
    setSelectedDate(undefined); // Reset the selected date after task is created
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

  // Handler for closing the modal (also reset selected date)
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedDate(undefined); // Reset date when closing modal
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
        onClose={handleCloseModal}
        onSubmit={handleTaskSubmit}
        initialData={selectedDate ? { dueDate: formatDate(selectedDate) } : {}}
        key={selectedDate ? selectedDate.toISOString() : 'default'} // Add key to force re-render with fresh state
      />
    </div>
  );
};

// Helper function to format date to YYYY-MM-DD
function formatDate(date: Date) {
  console.log('Formatting date in TagTasks:', date);
  const formatted = format(date, 'yyyy-MM-dd');
  console.log('Formatted result in TagTasks:', formatted);
  return formatted;
}

export default TagTasks;
