
import TagTaskListWrapper from '@/components/tasks/TagTaskList';
import { useIsMobile } from '@/hooks/use-mobile';

const TagTasks = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`container ${isMobile ? 'px-2 sm:px-4' : 'py-6'}`}>
      <TagTaskListWrapper />
    </div>
  );
};

export default TagTasks;
