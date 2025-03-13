
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskCard from './TaskCard';
import { TaskProps } from './types';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTasks } from '@/hooks/use-tasks';

interface SearchTasksSheetProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SearchTasksSheet: React.FC<SearchTasksSheetProps> = ({ 
  trigger,
  isOpen,
  onOpenChange
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { tasks, loading } = useTasks();
  const [filteredTasks, setFilteredTasks] = useState<TaskProps[]>([]);

  // Sync internal open state with external control if provided
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Notify parent component about open state changes if callback provided
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = tasks.filter(task => 
      task.title.toLowerCase().includes(query) || 
      (task.description && task.description.toLowerCase().includes(query))
    );
    
    setFilteredTasks(results);
  }, [searchQuery, tasks]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>Search Tasks</SheetTitle>
        </SheetHeader>
        
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by task title or description..."
            className="pl-8 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <TasksProvider initialTasks={filteredTasks}>
          <ScrollArea className="h-[calc(100vh-180px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : searchQuery.trim() === '' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">Enter a search term to find tasks</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No tasks found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    {...task} 
                    // Remove onClick prop as it's not in TaskProps
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TasksProvider>
      </SheetContent>
    </Sheet>
  );
};

export default SearchTasksSheet;
