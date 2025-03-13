
import { useEffect, useState } from 'react';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import WeekView from './WeekView';
import { formatFullDate } from './utils';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { useWeekController } from '@/hooks/use-week-controller';
import { mockTasks } from './mockData';

const TaskList = () => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [customOrder, setCustomOrder] = useState<string[]>(mockTasks.map(task => task.id));
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  
  const {
    currentDate,
    selectedDate,
    isScrolled,
    setIsScrolled,
    setSelectedDate,
    previousWeek,
    nextWeek,
    goToToday
  } = useWeekController();
  
  const {
    sortedTasks,
    overdueTasks,
    todayTasks,
    futureDatesGrouped
  } = useTaskDateGroups(mockTasks, viewOption, sortOption, customOrder, selectedDate);
  
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
  }, [setIsScrolled]);

  return (
    <TasksProvider initialTasks={mockTasks}>
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
            tasks={overdueTasks}
            isOpen={isOverdueOpen}
            onOpenChange={setIsOverdueOpen}
            selectedDate={selectedDate}
            sortOption={sortOption}
          />
          
          <TaskSection 
            title="Today"
            tasks={todayTasks}
            sortOption={sortOption}
            selectedDate={selectedDate}
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
              />
            );
          })}
        </div>
      </div>
    </TasksProvider>
  );
};

export default TaskList;
