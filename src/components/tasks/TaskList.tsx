
import { useState } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ButtonCustom } from '@/components/ui/button-custom';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';
import TaskCard, { TaskProps } from './TaskCard';

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
  }
];

const TaskList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewOption, setViewOption] = useState('all');
  const [sortOption, setSortOption] = useState('date');

  // Filter tasks based on search query and view option
  const filteredTasks = mockTasks.filter(task => {
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
    }
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <ButtonCustom 
          variant="primary"
          className="rounded-full"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {/* Open task creation modal */}}
        >
          New Task
        </ButtonCustom>
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
            >
              {sortOption === 'date' ? 'Sort by Date' : 'Sort by Priority'}
            </ButtonCustom>
            <div className="absolute right-0 mt-1 w-40 bg-popover shadow-lg rounded-md p-1 border border-border hidden">
              <button 
                className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent"
                onClick={() => setSortOption('date')}
              >
                Sort by Date
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-sm rounded-sm hover:bg-accent"
                onClick={() => setSortOption('priority')}
              >
                Sort by Priority
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {groupedTasks.overdue.length > 0 && (
          <div>
            <h2 className="flex items-center mb-3 text-destructive">
              <span className="text-sm font-medium">Overdue</span>
              <span className="ml-2 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
                {groupedTasks.overdue.length}
              </span>
            </h2>
            <div className="space-y-2">
              {groupedTasks.overdue.map(task => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>
        )}
        
        {groupedTasks.today.length > 0 && (
          <div>
            <h2 className="flex items-center mb-3">
              <span className="text-sm font-medium">Today</span>
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-500 rounded text-xs">
                {groupedTasks.today.length}
              </span>
            </h2>
            <div className="space-y-2">
              {groupedTasks.today.map(task => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>
        )}
        
        {groupedTasks.tomorrow.length > 0 && (
          <div>
            <h2 className="flex items-center mb-3">
              <span className="text-sm font-medium">Tomorrow</span>
              <span className="ml-2 px-1.5 py-0.5 bg-violet-100 text-violet-700 dark:bg-violet-800/30 dark:text-violet-500 rounded text-xs">
                {groupedTasks.tomorrow.length}
              </span>
            </h2>
            <div className="space-y-2">
              {groupedTasks.tomorrow.map(task => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>
        )}
        
        {groupedTasks.upcoming.length > 0 && (
          <div>
            <h2 className="flex items-center mb-3">
              <span className="text-sm font-medium">Upcoming</span>
              <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-500 rounded text-xs">
                {groupedTasks.upcoming.length}
              </span>
            </h2>
            <div className="space-y-2">
              {groupedTasks.upcoming.map(task => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>
        )}
        
        {viewOption !== 'active' && groupedTasks.completed.length > 0 && (
          <div>
            <h2 className="flex items-center mb-3">
              <span className="text-sm font-medium">Completed</span>
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400 rounded text-xs">
                {groupedTasks.completed.length}
              </span>
            </h2>
            <div className="space-y-2">
              {groupedTasks.completed.map(task => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>
        )}
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
