
import TaskList from '@/components/tasks/TaskList';

const Tasks = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>
      
      <TaskList />
    </div>
  );
};

export default Tasks;
