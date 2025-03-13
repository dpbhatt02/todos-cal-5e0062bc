
import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, isBefore, differenceInDays } from 'date-fns';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ButtonCustom } from '@/components/ui/button-custom';
import { TaskProps } from './types';
import WeekView from './WeekView';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import { formatFullDate } from './utils';

// Sample tasks data for demonstration - same as in TaskList.tsx
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
  },
  // Add 10 more tasks for upcoming days
  {
    id: '7',
    title: 'Family dinner',
    description: 'Prepare dinner for family gathering',
    priority: 'medium',
    dueDate: addDays(new Date(), 1).toISOString().split('T')[0], // Tomorrow
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '8',
    title: 'Weekly report',
    description: 'Compile weekly progress report for team',
    priority: 'high',
    dueDate: addDays(new Date(), 2).toISOString().split('T')[0],
    completed: false,
    tags: ['work', 'personal'],
    recurring: undefined
  },
  {
    id: '9',
    title: 'Grocery shopping',
    description: 'Buy essentials for the week',
    priority: 'medium',
    dueDate: addDays(new Date(), 1).toISOString().split('T')[0],
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '10',
    title: 'Doctor appointment',
    description: 'Annual health checkup',
    priority: 'high',
    dueDate: addDays(new Date(), 3).toISOString().split('T')[0],
    completed: false,
    tags: ['health', 'personal'],
    recurring: undefined
  },
  {
    id: '11',
    title: 'Home maintenance',
    description: 'Fix kitchen sink and clean gutters',
    priority: 'low',
    dueDate: addDays(new Date(), 4).toISOString().split('T')[0],
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '12',
    title: 'Call parents',
    description: 'Weekly catch up with family',
    priority: 'medium',
    dueDate: addDays(new Date(), 2).toISOString().split('T')[0],
    completed: false,
    tags: ['personal'],
    recurring: { frequency: 'weekly' }
  },
  {
    id: '13',
    title: 'Update portfolio',
    description: 'Add recent projects to online portfolio',
    priority: 'low',
    dueDate: addDays(new Date(), 5).toISOString().split('T')[0],
    completed: false,
    tags: ['personal', 'learning'],
    recurring: undefined
  },
  {
    id: '14',
    title: 'Meditation session',
    description: '20-minute guided meditation',
    priority: 'medium',
    dueDate: addDays(new Date(), 1).toISOString().split('T')[0],
    completed: false,
    tags: ['health', 'personal'],
    recurring: { frequency: 'daily' }
  },
  {
    id: '15',
    title: 'Birthday gift shopping',
    description: 'Buy gift for friend\'s birthday party',
    priority: 'medium',
    dueDate: addDays(new Date(), 3).toISOString().split('T')[0],
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '16',
    title: 'Review monthly budget',
    description: 'Check expenses and update budget spreadsheet',
    priority: 'high',
    dueDate: addDays(new Date(), 4).toISOString().split('T')[0],
    completed: false,
    tags: ['personal'],
    recurring: { frequency: 'monthly' }
  }
];

interface TagTaskListProps {
  tagFilter: string;
}

const TagTaskList = ({ tagFilter }: TagTaskListProps) => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  const [customOrder, setCustomOrder] = useState<string[]>(mockTasks.map(task => task.id));
  const [isScrolled, setIsScrolled] = useState(false);

  // Filter tasks based on tag and view option
  const filteredTasks = mockTasks.filter(task => {
    const matchesTag = task.tags?.includes(tagFilter);
    const matchesViewOption = viewOption === 'all' 
      || (viewOption === 'completed' && task.completed)
      || (viewOption === 'active' && !task.completed);
    
    return matchesTag && matchesViewOption;
  });

  // Sort tasks - reuse the same sorting logic from TaskList
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === 'custom') {
      return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
    } else if (sortOption === 'date') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortOption === 'priority') {
      const priorityWeight = { low: 0, medium: 1, high: 2 };
      return priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight];
    }
    return 0;
  });
  
  // Group tasks by today, overdue, and future dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const groupedTasks = {
    overdue: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today && !task.completed;
    }),
    today: sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return isSameDay(taskDate, today);
    })
  };

  // Find the earliest and latest task dates
  const taskDates = sortedTasks.map(task => new Date(task.dueDate));
  
  // If there are task dates, find the latest one, otherwise use today + 30 days
  const latestTaskDate = taskDates.length > 0
    ? new Date(Math.max(...taskDates.map(date => date.getTime())))
    : addDays(today, 30);
  
  // Determine how many days to show (max 30 days or until the latest task date)
  const daysToShow = Math.min(30, differenceInDays(latestTaskDate, today) + 1);

  // Group future tasks by date
  const futureDatesGrouped: { [key: string]: TaskProps[] } = {};
  
  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(today, i);
    // Skip today as it's already handled separately
    if (i === 0) continue;
    
    const dateString = format(date, 'yyyy-MM-dd');
    futureDatesGrouped[dateString] = sortedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return isSameDay(taskDate, date);
    });
  }

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
  
  // Add scroll event listener to detect when to make WeekView compact
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50); // Compact when scrolled more than 50px
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <TaskListFilters 
        viewOption={viewOption}
        sortOption={sortOption}
        setViewOption={setViewOption}
        setSortOption={setSortOption}
      />
      
      <div className={`sticky top-0 bg-background z-10 transition-all duration-200 ${isScrolled ? 'pb-1 shadow-sm' : 'pb-3'}`}>
        <WeekView 
          currentDate={currentDate}
          selectedDate={selectedDate}
          tasks={sortedTasks}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
          onToday={goToToday}
          onSelectDay={setSelectedDate}
          isCompact={isScrolled}
        />
      </div>
      
      <div className="space-y-6">
        <OverdueTasksSection 
          tasks={groupedTasks.overdue}
          isOpen={isOverdueOpen}
          onOpenChange={setIsOverdueOpen}
          selectedDate={selectedDate}
          sortOption={sortOption}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
        />
        
        <TaskSection 
          title="Today"
          tasks={groupedTasks.today}
          sortOption={sortOption}
          selectedDate={today}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
        />
        
        {/* Upcoming Tasks grouped by date */}
        {Object.entries(futureDatesGrouped).map(([dateString, tasks]) => {
          if (tasks.length === 0) return null;
          
          const date = new Date(dateString);
          
          return (
            <TaskSection
              key={dateString}
              title={formatFullDate(date)}
              tasks={tasks}
              sortOption={sortOption}
              selectedDate={date}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TagTaskList;
