
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import TaskCard from './TaskCard';
import { useTasks } from '@/contexts/TasksContext';
import { TaskProps } from './types';
import { Button } from '@/components/ui/button';

interface SearchTasksSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchTasksSheet = ({ isOpen, onOpenChange }: SearchTasksSheetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TaskProps[]>([]);
  const { tasks } = useTasks();

  // Clear search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Search tasks as user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(term) || 
      (task.description && task.description.toLowerCase().includes(term)) ||
      (task.tags && task.tags.some(tag => tag.label.toLowerCase().includes(term)))
    );
    
    setSearchResults(filtered);
  }, [searchTerm, tasks]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90%] p-0">
        <SheetHeader className="text-left px-4 pt-4 pb-2 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle>Search Tasks</SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-full my-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search tasks..." 
              className="w-full pl-10 pr-4"
              autoFocus
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="px-4 py-2 space-y-2 overflow-y-auto max-h-[calc(100%-64px)]">
          {searchResults.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground py-1">
                Found {searchResults.length} {searchResults.length === 1 ? 'task' : 'tasks'}
              </p>
              {searchResults.map(task => (
                <TaskCard key={task.id} {...task} />
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-muted-foreground">No tasks match your search</p>
              ) : (
                <p className="text-muted-foreground">Enter a search term to find tasks...</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchTasksSheet;
