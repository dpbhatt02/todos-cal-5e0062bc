
import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TagsListProps {
  isSidebarOpen: boolean;
}

interface TagItem {
  id: string;
  label: string;
  color: string;
}

const TagsList = ({ isSidebarOpen }: TagsListProps) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [tags, setTags] = useState<TagItem[]>([
    { id: 'work', label: 'Work', color: 'bg-blue-500' },
    { id: 'personal', label: 'Personal', color: 'bg-purple-500' },
    { id: 'health', label: 'Health', color: 'bg-green-500' },
    { id: 'learning', label: 'Learning', color: 'bg-amber-500' },
  ]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Load tags from tasks when user logs in
  useEffect(() => {
    const fetchTags = async () => {
      // If no user is logged in, use default tags
      if (!user) return;
      
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('tags')
          .eq('user_id', user.id);
        
        if (tasksError) {
          console.error('Error fetching tags from tasks:', tasksError);
          return;
        }
        
        // Extract unique tags from tasks
        const tagsFromTasks = Array.from(new Set(
          tasksData
            .flatMap(task => task.tags || [])
            .filter(Boolean)
        ));
        
        if (tagsFromTasks.length > 0) {
          // Convert to tag items
          const tagItems = tagsFromTasks.map(tag => {
            const existingTag = tags.find(t => t.id === tag);
            return existingTag || { 
              id: tag, 
              label: tag.charAt(0).toUpperCase() + tag.slice(1), 
              color: tagColors[tag] || 'bg-gray-500' 
            };
          });
          
          setTags(tagItems);
        }
      } catch (error) {
        console.error('Error processing tags:', error);
      }
    };
    
    fetchTags();
  }, [user]);
  
  // Update active tag based on URL
  useEffect(() => {
    const tagMatch = location.pathname.match(/\/tag\/([^/]+)/);
    if (tagMatch) {
      setActiveTag(tagMatch[1]);
    } else {
      setActiveTag(null);
    }
  }, [location.pathname]);

  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId === activeTag ? null : tagId);
    navigate(`/tag/${tagId}`);
  };
  
  // Temporary tagColors mapping
  const tagColors: Record<string, string> = {
    work: 'bg-blue-500',
    personal: 'bg-purple-500',
    health: 'bg-green-500',
    learning: 'bg-amber-500',
  };

  // Show only the Tags header with icon when sidebar is closed
  if (!isSidebarOpen) {
    return (
      <div className="mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              Tags
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="space-y-1 mt-2">
          {tags.map((tag) => (
            <div 
              key={tag.id}
              className="relative"
              onMouseEnter={() => setHoveredTag(tag.id)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              <div 
                className="flex items-center justify-center cursor-pointer py-1.5"
                onClick={() => handleTagClick(tag.id)}
                id={`tag-${tag.id}`}
              >
                <div className={cn("h-2.5 w-2.5 rounded-full", tag.color)} />
              </div>
              {hoveredTag === tag.id && (
                <div 
                  className="fixed left-[4.5rem] z-[100] ml-1 whitespace-nowrap rounded-md bg-sidebar-primary px-3 py-1.5 text-xs font-medium text-sidebar-primary-foreground shadow-md animate-fade-in"
                  style={{ 
                    top: `${document.getElementById(`tag-${tag.id}`)?.getBoundingClientRect().top || 0}px`,
                  }}
                >
                  {tag.label}
                </div>
              )}
              {hoveredTag !== tag.id && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute inset-0 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {tag.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
