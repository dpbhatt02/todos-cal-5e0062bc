
import React from 'react';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tagColors } from './types';

interface TaskTagsProps {
  tags: string[];
}

const TaskTags = ({ tags }: TaskTagsProps) => {
  if (tags.length === 0) return null;
  
  return (
    <>
      {tags.slice(0, 2).map((tag) => (
        <div 
          key={tag}
          className="flex items-center text-xs px-1.5 py-0.5 rounded-full"
        >
          <span 
            className={cn("h-2 w-2 rounded-full mr-1", tagColors[tag] || tagColors.default)}
          />
          <span>{tag}</span>
        </div>
      ))}
      
      {tags.length > 2 && (
        <span className="text-xs text-muted-foreground">
          +{tags.length - 2} more
        </span>
      )}
    </>
  );
};

export default TaskTags;
