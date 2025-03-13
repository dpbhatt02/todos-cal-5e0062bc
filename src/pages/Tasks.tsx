
import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const Tasks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    setIsCreateModalOpen(false);
    toast.success('Task created successfully!');
    // In a real app, you would dispatch an action or call an API
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <ButtonCustom 
          variant="primary" 
          className="rounded-full"
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
