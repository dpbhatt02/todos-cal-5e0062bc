
import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';

interface TagsListProps {
  isSidebarOpen: boolean;
}

const TagsList = ({ isSidebarOpen }: TagsListProps) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const navigate = useNavigate();

  const tags = [
    { id: 'work', label: 'Work', color: 'bg-blue-500' },
    { id: 'personal', label: 'Personal', color: 'bg-purple-500' },
    { id: 'health', label: 'Health', color: 'bg-green-500' },
    { id: 'learning', label: 'Learning', color: 'bg-amber-500' },
  ];

  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId === activeTag ? null : tagId);
    navigate(`/tag/${tagId}`);
  };

  // Show only the Tags header with icon when sidebar is closed
  if (!isSidebarOpen) {
    return (
      <div className="mb-2">
        <div className="flex items-center justify-center">
          <Tag className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1 mt-2">
          {tags.map((tag) => (
            <div 
              key={tag.id}
              className="flex items-center justify-center cursor-pointer py-1.5"
              onClick={() => handleTagClick(tag.id)}
            >
              <div className={cn("h-2.5 w-2.5 rounded-full", tag.color)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
        </div>
        <ButtonCustom
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Add tag"
          icon={<span className="text-xs">+</span>}
        />
      </div>
      
      <div className="space-y-1">
        {tags.map((tag) => (
          <div 
            key={tag.id}
            className={cn(
              "flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
              activeTag === tag.id && "bg-muted/70"
            )}
            onClick={() => handleTagClick(tag.id)}
          >
            <div className={cn("h-2.5 w-2.5 rounded-full mr-2", tag.color)} />
            <span className="text-sm">{tag.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsList;
