
import { useState } from 'react';
import TagTaskListWrapper from '@/components/tasks/TagTaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTasksContext } from '@/contexts/TasksContext';

const TagTasks = () => {
  const isMobile = useIsMobile();
  const [syncing, setSyncing] = useState(false);
  const { synchronizeWithCalendar, isCalendarConnected } = useTasksContext();

  // Handler for creating a new task
  const handleCreateTask = () => {
    // This would typically open a modal or navigate to task creation
    console.log('Create task from tag view');
    // You would implement the actual task creation logic here
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
    </div>
  );
};

export default TagTasks;
