
import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

const Tasks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    setIsCreateModalOpen(false);
    // In a real app, you would dispatch an action or call an API
  };

  return (
    <div>
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
