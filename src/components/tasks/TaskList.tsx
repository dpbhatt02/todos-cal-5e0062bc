
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import WeekView from './WeekView';
import { formatFullDate } from './utils';
import { useTasksContext } from '@/contexts/TasksContext';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { useWeekController } from '@/hooks/use-week-controller';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  onTaskEdited?: () => void;
  onTaskDeleted?: () => void;
  onCreateTask: (date?: Date) => void; // Updated to accept a date parameter
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
  
  // Handler for clicking the "Add Task" button for a specific date
  const handleAddTaskForDate = (date: Date) => {
    // Add debug logs to see what date is being passed
    console.log('Add task clicked for date:', date);
    console.log('Date string format:', date.toISOString());
    console.log('Date local string:', date.toLocaleDateString());
    
    // Call the parent handler to open the modal with the selected date
    onCreateTask(date);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <TaskListFilters 
        viewOption={viewOption}
        sortOption={sortOption}
        setViewOption={setViewOption}
        setSortOption={setSortOption}
        onCreateTask={() => onCreateTask()} // Pass undefined to use default date
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
          
          {/* Today's Tasks Section with Add Task Button */}
          <div>
            <TaskSection 
              title="Today"
              tasks={todayTasks}
              sortOption={sortOption}
              selectedDate={selectedDate}
            />
            <div className="mt-2 pl-4">
              <Button 
                variant="ghost" 
                className="h-8 px-2 text-xs flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => handleAddTaskForDate(new Date())}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add task
              </Button>
            </div>
          </div>
          
          {/* Future Tasks Sections with Add Task Button for each day */}
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
                  <Button 
                    variant="ghost" 
                    className="h-8 px-2 text-xs flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => handleAddTaskForDate(date)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add task
                  </Button>
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
