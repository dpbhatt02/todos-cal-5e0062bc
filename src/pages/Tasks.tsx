
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';

const Tasks = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`container ${isMobile ? 'px-2 sm:px-4' : 'py-6'}`}>
      <TaskList />
    </div>
  );
};

export default Tasks;
