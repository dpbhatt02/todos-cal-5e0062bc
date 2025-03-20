
import { useEffect, useState } from 'react';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import WeekView from './WeekView';
import { formatFullDate } from './utils';
import { useTasksContext } from '@/contexts/TasksContext';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { useWeekController } from '@/hooks/use-week-controller';
import { useAuth } from '@/contexts/AuthContext';
import InlineTaskForm from './InlineTaskForm';

interface TaskListProps {
  onTaskEdited?: () => void;
  onTaskDeleted?: () => void;
  onCreateTask: () => void;
  onSyncCalendar: () => void;
  syncing: boolean;
  isCalendarConnected: boolean;
}

const TaskList = ({ 
  onTaskEdited, 
  onTaskDeleted, 
  onCreateTask, 
  onSyncCalendar, 
  syncing, 
  isCalendarConnected 
}: TaskListProps) => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const { user } = useAuth();
  const { tasks, loading, customOrder, isOverdueOpen, setIsOverdueOpen } = useTasksContext();
  
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
  
  // Set up "quick add task" handler that opens the task creation modal
  // with the selected date pre-filled
  const handleQuickAddTask = (date: Date) => {
    // Set selected date to ensure the modal has the right date
    setSelectedDate(date);
    // Call the parent handler to open the modal
    onCreateTask();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <TaskListFilters 
        viewOption={viewOption}
        sortOption={sortOption}
        setViewOption={setViewOption}
        setSortOption={setSortOption}
        onCreateTask={onCreateTask}
        onSyncCalendar={onSyncCalendar}
        syncing={syncing}
        isCalendarConnected={isCalendarConnected}
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
          
          {/* Today's Tasks Section with Quick Add Form */}
          <div>
            <TaskSection 
              title="Today"
              tasks={todayTasks}
              sortOption={sortOption}
              selectedDate={selectedDate}
            />
            <div className="mt-2 pl-4">
              <InlineTaskForm 
                date={new Date()} 
                onCreateTask={onTaskEdited}
              />
            </div>
          </div>
          
          {/* Future Tasks Sections with Quick Add Form for each day */}
          {Object.entries(futureDatesGrouped).map(([dateString, tasks]) => {
            const date = new Date(dateString);
            
            return (
              <div key={dateString}>
                <TaskSection
                  title={formatFullDate(date)}
                  tasks={tasks}
                  sortOption={sortOption}
                  selectedDate={date}
                />
                <div className="mt-2 pl-4">
                  <InlineTaskForm 
                    date={date} 
                    onCreateTask={onTaskEdited}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;
