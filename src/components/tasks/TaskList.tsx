
import { useEffect, useState } from 'react';
import TaskListFilters from './TaskListFilters';
import OverdueTasksSection from './OverdueTasksSection';
import TaskSection from './TaskSection';
import WeekView from './WeekView';
import { formatFullDate } from './utils';
import { TasksProvider } from '@/contexts/TasksContext';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { useWeekController } from '@/hooks/use-week-controller';
import { useTasks } from '@/contexts/TasksContext';
import CreateTaskModal from './CreateTaskModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const TaskListContent = () => {
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    tasks,
    isLoading,
    error,
    customOrder,
    isOverdueOpen,
    setIsOverdueOpen,
    createTask
  } = useTasks();
  
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

  const handleTaskCreate = async (taskData: any) => {
    try {
      // Convert form data to proper task format
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: new Date(taskData.dueDate),
        completed: false,
        tags: taskData.tags,
        recurring: taskData.recurring !== 'none' ? {
          frequency: taskData.recurring,
          endDate: taskData.recurrenceEndType === 'date' ? new Date(taskData.recurrenceEndDate) : undefined,
          endAfter: taskData.recurrenceEndType === 'after' ? taskData.recurrenceCount : undefined,
          customDays: taskData.selectedWeekdays
        } : undefined
      };
      
      await createTask(newTask);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading tasks...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <TaskListFilters 
          viewOption={viewOption}
          sortOption={sortOption}
          setViewOption={setViewOption}
          setSortOption={setSortOption}
        />
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>
      
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

      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleTaskCreate}
      />
    </div>
  );
};

const TaskList = () => {
  return (
    <TasksProvider>
      <TaskListContent />
    </TasksProvider>
  );
};

export default TaskList;
