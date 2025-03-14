
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks } from '@/contexts/TasksContext';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import { tagColors } from './types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Define the props for the TagTaskListWrapper component
interface TagTaskListWrapperProps {}

const TagTaskListWrapper: React.FC<TagTaskListWrapperProps> = () => {
  // Get the tag from the URL params
  const { tag } = useParams<{ tag: string }>();
  const isMobile = useIsMobile();
  
  // Task management states
  const { 
    tasks, 
    isLoading, 
    error,
    updateTask,
    deleteTask,
    rescheduleTask 
  } = useTasks();
  
  // States for UI management
  const [selectedTag, setSelectedTag] = useState<string>(tag || '');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Filter tasks by the selected tag
  const filteredTasks = tasks.filter(task => 
    task.tags && task.tags.includes(selectedTag)
  );
  
  // Group tasks by completion status
  const completedTasks = filteredTasks.filter(task => task.completed);
  const incompleteTasks = filteredTasks.filter(task => !task.completed);
  
  // Handle task updates
  const handleUpdateTask = async (task: TaskProps) => {
    try {
      await updateTask(task.id, task);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };
  
  // Handle rescheduling a task
  const handleRescheduleTask = async (id: string, newDate: Date) => {
    try {
      await rescheduleTask(id, newDate);
      toast.success('Task rescheduled successfully!');
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast.error('Failed to reschedule task');
    }
  };
  
  // Update selected tag when the URL param changes
  useEffect(() => {
    if (tag) {
      setSelectedTag(tag);
    }
  }, [tag]);
  
  // Find the unique tags from all tasks for the dropdown
  const availableTags = [...new Set(
    tasks.flatMap(task => task.tags || [])
  )];

  if (isLoading) {
    return <div className="text-center py-10">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Error: {error}</div>;
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Tag selection dropdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Tasks by Tag</h1>
            
            <select 
              className="p-2 rounded border"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">Select a tag</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          {/* Toggle for completed tasks */}
          {completedTasks.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Hide Completed
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" /> Show Completed ({completedTasks.length})
                </>
              )}
            </button>
          )}
        </div>
        
        {selectedTag && (
          <div 
            className={`px-3 py-1 text-xs rounded-full inline-block mt-2 ${tagColors[selectedTag] || 'bg-gray-500'} text-white`}
          >
            {selectedTag}
          </div>
        )}
      </div>
      
      {/* Show message if no tag selected */}
      {!selectedTag ? (
        <div className="text-center py-10 text-muted-foreground">
          Please select a tag to view tasks
        </div>
      ) : (
        <>
          {/* Show message if no tasks for the selected tag */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No tasks found with the tag "{selectedTag}"
            </div>
          ) : (
            <div className="space-y-6">
              {/* Incomplete tasks */}
              {incompleteTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Active Tasks</h2>
                  <div className="space-y-2">
                    {incompleteTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        {...task}
                        onEdit={handleUpdateTask}
                        onDelete={handleDeleteTask}
                        onReschedule={handleRescheduleTask}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Completed tasks (collapsible) */}
              {completedTasks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Completed Tasks</h2>
                  {isExpanded && (
                    <div className="space-y-2">
                      {completedTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          {...task}
                          onEdit={handleUpdateTask}
                          onDelete={handleDeleteTask}
                          onReschedule={handleRescheduleTask}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TagTaskListWrapper;
