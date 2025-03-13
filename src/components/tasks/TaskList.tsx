import { useState, useRef } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ButtonCustom } from '@/components/ui/button-custom';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import TaskCard, { TaskProps } from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import { toast } from 'sonner';

// Sample tasks data for demonstration
const mockTasks: TaskProps[] = [
  {
    id: '1',
    title: 'Finalize project proposal',
    description: 'Complete the final draft of the project proposal with all required sections.',
    priority: 'high',
    dueDate: '2023-09-20',
    completed: false,
    tags: ['work']
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up a team meeting to discuss the upcoming sprint goals and assignments.',
    priority: 'medium',
    dueDate: '2023-09-21',
    completed: false,
    tags: ['work']
  },
  {
    id: '3',
    title: 'Gym workout',
    description: 'Complete 30-minute cardio and strength training session.',
    priority: 'low',
    dueDate: '2023-09-19',
    completed: true,
    tags: ['health', 'personal']
  },
  {
    id: '4',
    title: 'Read book chapter',
    description: 'Read chapter 5 of "Atomic Habits" and take notes.',
    priority: 'medium',
    dueDate: '2023-09-22',
    completed: false,
    tags: ['learning', 'personal']
  },
  {
    id: '5',
    title: 'Pay utility bills',
    description: 'Pay electricity, water, and internet bills before the due date.',
    priority: 'high',
    dueDate: '2023-09-19',
    completed: false,
    tags: ['personal']
  },
  // Adding the new task with time duration and link
  {
    id: '6',
    title: 'Project review meeting',
    description: 'Review project progress and discuss next steps. Check the <a href="https://example.com/project-docs" class="text-blue-500 underline hover:text-blue-700">project documentation</a> before the meeting.',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], // Today's date
    startTime: '16:00', // 4:00 PM
    endTime: '17:00',   // 5:00 PM
    completed: false,
    tags: ['work', 'meeting']
  }
];

const TaskList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewOption, setViewOption] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskProps | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tasks, setTasks] = useState(mockTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggedOverId = useRef<string | null>(null);
  
  // Collapsible section states
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [todayOpen, setTodayOpen] = useState(true);
  const [tomorrowOpen, setTomorrowOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(false);

  // Filter tasks based on search query and view option
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesViewOption = viewOption === 'all' 
      || (viewOption === 'completed' && task.completed)
      || (viewOption === 'active' && !task.completed);
    
    return matchesSearch && matchesViewOption;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === 'date') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortOption === 'priority') {
      const priorityWeight = { low: 0, medium: 1, high: 2 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    } else if (sortOption === 'tags') {
      // Sort by first tag alphabetically
      const aTag = a.tags && a.tags.length > 0 ? a.tags[0] : '';
      const bTag = b.tags && b.tags.length > 0 ? b.tags[0] : '';
      return aTag.localeCompare(bTag);
    }
    // If custom sort, use the current order (which is maintained by drag and drop)
    return 0;
  });
  
  // Group tasks by today, tomorrow, upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const groupedTasks = {
    overdue: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today && !task.completed;
    }),
    today: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }),
    tomorrow: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === tomorrow.getTime();
    }),
    upcoming: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > tomorrow;
    }),
    completed: sortedTasks.filter(task => task.completed)
  };

  const handleTaskClick = (task: TaskProps) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };
  
  const handleRescheduleOverdue = () => {
    console.log('Reschedule overdue tasks');
    // In a real app, this would open a modal to reschedule all overdue tasks
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    if (sortOption === 'custom') {
      setDraggingId(id);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    draggedOverId.current = id;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggingId && draggedOverId.current && sortOption === 'custom') {
      const newTasks = [...tasks];
      const draggedIndex = newTasks.findIndex(task => task.id === draggingId);
      const dropIndex = newTasks.findIndex(task => task.id === draggedOverId.current);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Remove the dragged item
        const [draggedTask] = newTasks.splice(draggedIndex, 1);
        // Insert it at the new position
        newTasks.splice(dropIndex, 0, draggedTask);
        setTasks(newTasks);
        toast.success("Task reordered successfully");
      }
      
      setDraggingId(null);
      draggedOverId.current = null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <ToggleGroup type="single" value={viewOption} onValueChange={(value) => value && setViewOption(value)}>
            <ToggleGroupItem value="all" aria-label="Show all tasks">All</ToggleGroupItem>
            <ToggleGroupItem value="active" aria-label="Show active tasks">Active</ToggleGroupItem>
            <ToggleGroupItem value="completed" aria-label="Show completed tasks">Completed</ToggleGroupItem>
          </ToggleGroup>
          
          <div className="relative">
            <ButtonCustom 
              variant="outline" 
              className="flex items-center gap-1"
              icon={<ChevronDown className="h-4 w-4 ml-1" />}
              iconPosition="right"
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            >
              {sortOption === 'date' ? 'Sort by Date' : 
               sortOption === 'priority' ? 'Sort by Priority' : 
               sortOption === 'tags' ? 'Sort by Tags' : 
               'Custom Order'}
            </ButtonCustom>
            <div className={`absolute right-0 mt-1 w-40 bg-popover shadow-lg rounded-md p-1 border border-border ${isSortMenuOpen ? 'block' : 'hidden'}`}>
              <button 
                className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent"
                onClick={() => {
                  setSortOption('date');
                  setIsSortMenuOpen(false);
                }}
              >
                Sort by Date
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent"
                onClick={() => {
                  setSortOption('priority');
                  setIsSortMenuOpen(false);
                }}
              >
                Sort by Priority
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent"
                onClick={() => {
                  setSortOption('tags');
                  setIsSortMenuOpen(false);
                }}
              >
                Sort by Tags
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent"
                onClick={() => {
                  setSortOption('custom');
                  setIsSortMenuOpen(false);
                  toast.info("Drag tasks to reorder them");
                }}
              >
                Custom Order
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {groupedTasks.overdue.length > 0 && (
          <Collapsible
            open={overdueOpen}
            onOpenChange={setOverdueOpen}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <CollapsibleTrigger className="flex items-center gap-2 text-destructive font-medium hover:underline focus:outline-none">
                {overdueOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
                <span>Overdue</span>
                <span className="ml-2 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
                  {groupedTasks.overdue.length}
                </span>
              </CollapsibleTrigger>
              <button 
                onClick={handleRescheduleOverdue} 
                className="text-sm text-destructive hover:underline focus:outline-none"
              >
                Reschedule
              </button>
            </div>
            <CollapsibleContent>
              <div className="px-4 py-2 space-y-2">
                {groupedTasks.overdue.map(task => (
                  <div 
                    key={task.id}
                    draggable={sortOption === 'custom'}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDrop={handleDrop}
                    className={`${draggingId === task.id ? 'opacity-50' : 'opacity-100'} ${sortOption === 'custom' ? 'cursor-move' : ''}`}
                  >
                    {sortOption === 'custom' && (
                      <div className="flex items-center">
                        <div className="p-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <TaskCard 
                            {...task} 
                            onClick={() => handleTaskClick(task)}
                          />
                        </div>
                      </div>
                    )}
                    {sortOption !== 'custom' && (
                      <TaskCard 
                        {...task} 
                        onClick={() => handleTaskClick(task)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {groupedTasks.today.length > 0 && (
          <Collapsible
            open={todayOpen}
            onOpenChange={setTodayOpen}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 bg-muted/30">
              <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:underline focus:outline-none">
                {todayOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
                <span>Today</span>
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-500 rounded text-xs">
                  {groupedTasks.today.length}
                </span>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="px-4 py-2 space-y-2">
                {groupedTasks.today.map(task => (
                  <div 
                    key={task.id}
                    draggable={sortOption === 'custom'}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDrop={handleDrop}
                    className={`${draggingId === task.id ? 'opacity-50' : 'opacity-100'} ${sortOption === 'custom' ? 'cursor-move' : ''}`}
                  >
                    {sortOption === 'custom' && (
                      <div className="flex items-center">
                        <div className="p-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <TaskCard 
                            {...task} 
                            onClick={() => handleTaskClick(task)}
                          />
                        </div>
                      </div>
                    )}
                    {sortOption !== 'custom' && (
                      <TaskCard 
                        {...task} 
                        onClick={() => handleTaskClick(task)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {groupedTasks.tomorrow.length > 0 && (
          <Collapsible
            open={tomorrowOpen}
            onOpenChange={setTomorrowOpen}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 bg-muted/30">
              <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:underline focus:outline-none">
                {tomorrowOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
                <span>Tomorrow</span>
                <span className="ml-2 px-1.5 py-0.5 bg-violet-100 text-violet-700 dark:bg-violet-800/30 dark:text-violet-500 rounded text-xs">
                  {groupedTasks.tomorrow.length}
                </span>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="px-4 py-2 space-y-2">
                {groupedTasks.tomorrow.map(task => (
                  <div 
                    key={task.id}
                    draggable={sortOption === 'custom'}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDrop={handleDrop}
                    className={`${draggingId === task.id ? 'opacity-50' : 'opacity-100'} ${sortOption === 'custom' ? 'cursor-move' : ''}`}
                  >
                    {sortOption === 'custom' && (
                      <div className="flex items-center">
                        <div className="p-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <TaskCard 
                            {...task} 
                            onClick={() => handleTaskClick(task)}
                          />
                        </div>
                      </div>
                    )}
                    {sortOption !== 'custom' && (
                      <TaskCard 
                        {...task} 
                        onClick={() => handleTaskClick(task)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {groupedTasks.upcoming.length > 0 && (
          <Collapsible
            open={upcomingOpen}
            onOpenChange={setUpcomingOpen}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 bg-muted/30">
              <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:underline focus:outline-none">
                {upcomingOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
                <span>Upcoming</span>
                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-500 rounded text-xs">
                  {groupedTasks.upcoming.length}
                </span>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="px-4 py-2 space-y-2">
                {groupedTasks.upcoming.map(task => (
                  <div 
                    key={task.id}
                    draggable={sortOption === 'custom'}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDrop={handleDrop}
                    className={`${draggingId === task.id ? 'opacity-50' : 'opacity-100'} ${sortOption === 'custom' ? 'cursor-move' : ''}`}
                  >
                    {sortOption === 'custom' && (
                      <div className="flex items-center">
                        <div className="p-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <TaskCard 
                            {...task} 
                            onClick={() => handleTaskClick(task)}
                          />
                        </div>
                      </div>
                    )}
                    {sortOption !== 'custom' && (
                      <TaskCard 
                        {...task} 
                        onClick={() => handleTaskClick(task)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {viewOption !== 'active' && groupedTasks.completed.length > 0 && (
          <Collapsible
            open={completedOpen}
            onOpenChange={setCompletedOpen}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 bg-muted/30">
              <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:underline focus:outline-none">
                {completedOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
                <span>Completed</span>
                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400 rounded text-xs">
                  {groupedTasks.completed.length}
                </span>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="px-4 py-2 space-y-2">
                {groupedTasks.completed.map(task => (
                  <div 
                    key={task.id}
                    draggable={sortOption === 'custom'}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDrop={handleDrop}
                    className={`${draggingId === task.id ? 'opacity-50' : 'opacity-100'} ${sortOption === 'custom' ? 'cursor-move' : ''}`}
                  >
                    {sortOption === 'custom' && (
                      <div className="flex items-center">
                        <div className="p-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <TaskCard 
                            {...task} 
                            onClick={() => handleTaskClick(task)}
                          />
                        </div>
                      </div>
                    )}
                    {sortOption !== 'custom' && (
                      <TaskCard 
                        {...task} 
                        onClick={() => handleTaskClick(task)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-10 border border-border/40 rounded-lg">
            <p className="text-muted-foreground">No tasks found.</p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onComplete={() => console.log('Complete task:', selectedTask.id)}
          onEdit={() => console.log('Edit task:', selectedTask.id)}
          onDelete={() => console.log('Delete task:', selectedTask.id)}
        />
      )}
    </div>
  );
};

export default TaskList;
