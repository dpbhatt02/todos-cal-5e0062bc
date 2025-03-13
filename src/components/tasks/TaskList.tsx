
import { useEffect, useState } from 'react';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import WeekView from './WeekView';
import { formatFullDate } from './utils';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { useWeekController } from '@/hooks/use-week-controller';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/contexts/AuthContext';

const TaskList = () => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  const { user } = useAuth();
  const { tasks, loading } = useTasks();
  
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
  
  useEffect(() => {
    if (tasks.length > 0) {
      setCustomOrder(tasks.map(task => task.id));
    }
  }, [tasks]);
  
  const {
    sortedTasks,
    overdueTasks,
    todayTasks,
    futureDatesGrouped
  } = useTaskDateGroups(tasks, viewOption, sortOption, customOrder, selectedDate);
  
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

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto mt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
        <p className="text-muted-foreground">You need to be logged in to view and manage your tasks.</p>
      </div>
    );
  }

  return (
    <TasksProvider>
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
        
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : (
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
        )}
      </div>
    </TasksProvider>
  );
};

export default TaskList;
