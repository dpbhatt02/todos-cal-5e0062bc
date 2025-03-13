
import { useState } from 'react';
import { Filter, ChevronDown, ChevronRight, ChevronLeft, ArrowDownAZ, ArrowUpAZ, Move, RefreshCcw } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addMonths, subMonths, parse } from 'date-fns';
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
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up a team meeting to discuss the upcoming sprint goals and assignments.',
    priority: 'medium',
    dueDate: '2023-09-21',
    completed: false,
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '3',
    title: 'Gym workout',
    description: 'Complete 30-minute cardio and strength training session.',
    priority: 'low',
    dueDate: '2023-09-19',
    completed: true,
    tags: ['health', 'personal'],
    recurring: undefined
  },
  {
    id: '4',
    title: 'Read book chapter',
    description: 'Read chapter 5 of "Atomic Habits" and take notes.',
    priority: 'medium',
    dueDate: '2023-09-22',
    completed: false,
    tags: ['learning', 'personal'],
    recurring: undefined
  },
  {
    id: '5',
    title: 'Pay utility bills',
    description: 'Pay electricity, water, and internet bills before the due date.',
    priority: 'high',
    dueDate: '2023-09-19',
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '6',
    title: 'Daily review',
    description: 'Review tasks and plan for tomorrow.',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0], // Today's date
    completed: false,
    tags: ['work', 'personal'],
    recurring: { frequency: 'daily' }
  }
];

const TaskList = () => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  const [customOrder, setCustomOrder] = useState<string[]>(mockTasks.map(task => task.id));

  // Filter tasks based on view option
  const filteredTasks = mockTasks.filter(task => {
    const matchesViewOption = viewOption === 'all' 
      || (viewOption === 'completed' && task.completed)
      || (viewOption === 'active' && !task.completed);
    
    return matchesViewOption;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === 'custom') {
      return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
    } else if (sortOption === 'date') {
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
      return isSameDay(taskDate, selectedDate);
    }),
    upcoming: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return !isSameDay(taskDate, selectedDate) && taskDate > today;
    }),
  };

  // Generate week view 
  const getWeekDays = () => {
    const days = [];
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday

    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      days.push({
        date,
        day: format(date, 'd'),
        weekday: format(date, 'EEE'),
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        hasTask: sortedTasks.some(task => {
          const taskDate = new Date(task.dueDate);
          return isSameDay(taskDate, date);
        })
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  // Navigate between weeks
  const previousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Navigate between months for the month selector
  const previousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  // Format the selected date for display
  const getSelectedDateDisplay = () => {
    const day = format(selectedDate, 'd');
    const month = format(selectedDate, 'MMM');
    const dayName = format(selectedDate, 'EEEE');
    return `${day} ${month} · Today · ${dayName}`;
  };

  // Check if the selected date is today
  const isSelectedDateToday = isSameDay(selectedDate, today);

  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-muted/30');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-muted/30');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-muted/30');
    
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId === taskId) return;
    
    const newOrder = [...customOrder];
    const draggedIndex = newOrder.indexOf(draggedTaskId);
    const dropIndex = newOrder.indexOf(taskId);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedTaskId);
    
    setCustomOrder(newOrder);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
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
          
          {/* Sort Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonCustom 
                variant="outline" 
                className="flex items-center gap-1"
                icon={
                  sortOption === 'date' ? <ArrowDownAZ className="h-4 w-4 mr-1" /> : 
                  sortOption === 'priority' ? <ArrowUpAZ className="h-4 w-4 mr-1" /> :
                  <Move className="h-4 w-4 mr-1" />
                }
              >
                {sortOption === 'date' ? 'Sort by Date' : 
                 sortOption === 'priority' ? 'Sort by Priority' : 
                 'Custom Order'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </ButtonCustom>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOption('date')}>
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('priority')}>
                Sort by Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('custom')}>
                Custom Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Date header with month picker */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium">Upcoming</h2>
            <Popover>
              <PopoverTrigger asChild>
                <ButtonCustom variant="ghost" className="flex items-center gap-1 text-md font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </ButtonCustom>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCurrentDate(date);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2">
            <ButtonCustom 
              variant="outline" 
              size="icon" 
              onClick={previousWeek}
              className="h-8 w-8"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </ButtonCustom>
            
            <ButtonCustom 
              variant="outline" 
              onClick={goToToday}
              className="h-8"
            >
              Today
            </ButtonCustom>
            
            <ButtonCustom 
              variant="outline" 
              size="icon" 
              onClick={nextWeek}
              className="h-8 w-8"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </ButtonCustom>
          </div>
        </div>
        
        {/* Week day selector */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors 
                ${day.isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
              `}
            >
              <span className="text-sm font-normal">{day.weekday}</span>
              <span className={`text-xl font-semibold my-1 ${day.hasTask && !day.isSelected ? 'text-primary' : ''}`}>
                {day.day}
              </span>
              {day.hasTask && !day.isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
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
                <ChevronRight className={`h-5 w-5 mr-2 transition-transform ${isOverdueOpen ? 'rotate-90' : ''}`} />
                <span className="text-md font-medium text-destructive">Overdue</span>
                <span className="ml-2 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
                  {groupedTasks.overdue.length}
                </span>
              </div>
              <ButtonCustom
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Reschedule
              </ButtonCustom>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 ml-7">
                {groupedTasks.overdue.map(task => (
                  <div 
                    key={task.id}
                    draggable={sortOption === 'custom'}
                    onDragStart={(e) => sortOption === 'custom' && handleDragStart(e, task.id)}
                    onDragOver={(e) => sortOption === 'custom' && handleDragOver(e)}
                    onDragLeave={(e) => sortOption === 'custom' && handleDragLeave(e)}
                    onDrop={(e) => sortOption === 'custom' && handleDrop(e, task.id)}
                    onDragEnd={(e) => sortOption === 'custom' && handleDragEnd(e)}
                    className={sortOption === 'custom' ? 'cursor-move' : ''}
                  >
                    <TaskCard {...task} />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Today's Tasks with date display */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {getSelectedDateDisplay()}
          </h2>
          
          <div className="space-y-2">
            {groupedTasks.today.length > 0 ? (
              groupedTasks.today.map(task => (
                <div 
                  key={task.id}
                  draggable={sortOption === 'custom'}
                  onDragStart={(e) => sortOption === 'custom' && handleDragStart(e, task.id)}
                  onDragOver={(e) => sortOption === 'custom' && handleDragOver(e)}
                  onDragLeave={(e) => sortOption === 'custom' && handleDragLeave(e)}
                  onDrop={(e) => sortOption === 'custom' && handleDrop(e, task.id)}
                  onDragEnd={(e) => sortOption === 'custom' && handleDragEnd(e)}
                  className={sortOption === 'custom' ? 'cursor-move' : ''}
                >
                  <TaskCard {...task} />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Tasks (not for the selected date) */}
        {groupedTasks.upcoming.length > 0 && !isSelectedDateToday && (
          <div className="mt-8">
            <h2 className="text-md font-medium mb-3">Upcoming</h2>
            <div className="space-y-2">
              {groupedTasks.upcoming.map(task => (
                <div 
                  key={task.id}
                  draggable={sortOption === 'custom'}
                  onDragStart={(e) => sortOption === 'custom' && handleDragStart(e, task.id)}
                  onDragOver={(e) => sortOption === 'custom' && handleDragOver(e)}
                  onDragLeave={(e) => sortOption === 'custom' && handleDragLeave(e)}
                  onDrop={(e) => sortOption === 'custom' && handleDrop(e, task.id)}
                  onDragEnd={(e) => sortOption === 'custom' && handleDragEnd(e)}
                  className={sortOption === 'custom' ? 'cursor-move' : ''}
                >
                  <TaskCard {...task} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
