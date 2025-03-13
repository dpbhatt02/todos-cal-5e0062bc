
import { useParams } from 'react-router-dom';
import { tagColors } from '@/components/tasks/types';
import { cn } from '@/lib/utils';
import TagTaskList from '@/components/tasks/TagTaskList';

const TagTasks = () => {
  const { tagId } = useParams<{ tagId: string }>();
  
  // Format the tag name for display (capitalize first letter)
  const formatTagName = (tag: string) => {
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center">
        <div className={cn("h-3 w-3 rounded-full mr-2", tagColors[tagId || ''] || 'bg-gray-400')} />
        <h1 className="text-2xl font-semibold">{formatTagName(tagId || '')}</h1>
      </div>
      <TagTaskList tagFilter={tagId || ''} />
    </div>
  );
};

export default TagTasks;
