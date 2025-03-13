
import { useState } from 'react';
import { Filter, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { ButtonCustom } from '@/components/ui/button-custom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);

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
  };

  // The visible days of the current month for the day selection
  const getDaysOfCurrentMonth = () => {
    if (!selectedDate) return [];
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      return {
        date,
        day,
        isToday: date.getTime() === today.getTime(),
        hasTask: sortedTasks.some(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate.getDate() === day && 
                 taskDate.getMonth() === month && 
                 taskDate.getFullYear() === year;
        })
      };
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        
        <div className="flex gap-2">
          {/* Filter Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonCustom 
                variant="outline" 
                className="flex items-center gap-1"
                icon={<Filter className="h-4 w-4 mr-1" />}
              >
                {viewOption === 'all' ? 'All Tasks' : 
                 viewOption === 'active' ? 'Active Tasks' : 'Completed Tasks'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </ButtonCustom>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewOption('all')}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewOption('active')}>
                Active Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewOption('completed')}>
                Completed Tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonCustom 
                variant="outline" 
                className="flex items-center gap-1"
                icon={<ChevronDown className="h-4 w-4 ml-1" />}
                iconPosition="right"
              >
                {sortOption === 'date' ? 'Sort by Date' : 'Sort by Priority'}
              </ButtonCustom>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOption('date')}>
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('priority')}>
                Sort by Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Date Selection with Month */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">{format(selectedDate || new Date(), 'MMMM yyyy')}</h2>
          <Popover>
            <PopoverTrigger asChild>
              <ButtonCustom variant="outline" size="sm">
                Select Month
              </ButtonCustom>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Days of month row */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {getDaysOfCurrentMonth().slice(0, 7).map((_, index) => (
            <div key={`day-name-${index}`} className="text-center text-xs text-muted-foreground">
              {format(new Date(2023, 0, index + 2), 'EEE')}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Add any padding days at the start of the month */}
          {selectedDate && Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }, (_, i) => (
            <div key={`padding-start-${i}`} className="h-9 w-full"></div>
          ))}
          
          {getDaysOfCurrentMonth().map((dayInfo) => (
            <button
              key={`day-${dayInfo.day}`}
              className={`h-9 w-full rounded-full flex items-center justify-center text-sm relative ${
                dayInfo.isToday ? 'bg-primary text-primary-foreground' : 
                dayInfo.hasTask ? 'font-medium' : ''
              }`}
              onClick={() => setSelectedDate(dayInfo.date)}
            >
              {dayInfo.day}
              {dayInfo.hasTask && !dayInfo.isToday && (
                <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Collapsible Overdue Section */}
        {groupedTasks.overdue.length > 0 && (
          <Collapsible open={isOverdueOpen} onOpenChange={setIsOverdueOpen}>
            <CollapsibleTrigger className="flex items-center w-full justify-between text-left mb-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-destructive">Overdue</span>
                <span className="ml-2 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
                  {groupedTasks.overdue.length}
                </span>
              </div>
              {isOverdueOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2">
                {groupedTasks.overdue.map(task => (
                  <TaskCard key={task.id} {...task} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
