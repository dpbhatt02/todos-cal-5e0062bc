
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { tagColors } from './types';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import WeekView from './WeekView';
import { formatFullDate } from './utils';
import { TasksProvider, useTasksContext } from '@/contexts/TasksContext';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { useWeekController } from '@/hooks/use-week-controller';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTasks } from '@/hooks/use-tasks';

interface TagTaskListProps {
  tagFilter: string;
}

const TagTaskList = ({ tagFilter }: TagTaskListProps) => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  const { tasks: allTasks, loading } = useTasks();
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  
  // Update customOrder when tasks change
  useEffect(() => {
    if (allTasks.length > 0) {
      setCustomOrder(allTasks.map(task => task.id));
    }
  }, [allTasks]);
  
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
  
  // Filter tasks based on tag
  const filteredByTagTasks = allTasks.filter(task => task.tags?.includes(tagFilter));
  
  const {
    sortedTasks,
    overdueTasks,
    todayTasks,
    futureDatesGrouped
  } = useTaskDateGroups(filteredByTagTasks, viewOption, sortOption, customOrder, selectedDate);
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [setIsScrolled]);

  // Create a today variable for the today section
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <TasksProvider initialTasks={filteredByTagTasks}>
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
            selectedDate={today}
          />
          
          {/* Upcoming Tasks grouped by date - display all days even if no tasks */}
          {Object.entries(futureDatesGrouped).map(([dateString, tasks]) => {
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

// Wrapper component to get the tag from URL params
const TagTaskListWrapper = () => {
  const { tagId } = useParams<{ tagId: string }>();
  const isMobile = useIsMobile();
  
  // Format the tag name for display (capitalize first letter)
  const formatTagName = (tag: string) => {
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  return (
    <>
      <div className="mb-6 flex items-center">
        <div className={cn("h-3 w-3 rounded-full mr-2", tagColors[tagId || ''] || 'bg-gray-400')} />
        <h1 className="text-2xl font-semibold">{formatTagName(tagId || '')}</h1>
      </div>
      <TagTaskList tagFilter={tagId || ''} />
    </>
  );
};

export default TagTaskListWrapper;
