
import { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import WeekView from '@/components/tasks/WeekView';
import { useTaskFiltering } from '@/hooks/use-task-filtering';
import { useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Tab } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { invokeSyncFunction } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { addMinutes } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { TaskProps } from '@/components/tasks/types';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  completed: boolean;
  priority: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Tasks = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const isMobile = useIsMobile();
  
  // Use view and sort options directly in Tasks component
  const [viewOption, setViewOption] = useState('active');
  const [sortOption, setSortOption] = useState('date');
  const customOrder: string[] = [];
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Use useTaskFiltering and useTaskDateGroups with correct parameters
  const { sortedTasks } = useTaskFiltering(
    tasks.map(mapDbTaskToTaskProps),
    viewOption, 
    sortOption, 
    customOrder
  );
  
  const { overdueTasks, todayTasks, futureDatesGrouped } = useTaskDateGroups(
    tasks.map(mapDbTaskToTaskProps),
    viewOption,
    sortOption,
    customOrder,
    selectedDate
  );
  
  const [currentTab, setCurrentTab] = useState<string>('list');
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialRender = useRef(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tasks:', error);
          return;
        }

        setTasks(data || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, navigate]);

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  const handleCreateTask = async (taskData: any) => {
    console.log('Creating task with data:', taskData);
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: new Date(taskData.dueDate).toISOString(),
      completed: false,
      startTime: null as string | null,
      endTime: null as string | null
    };

    // Add time information if present
    if (taskData.startTime) {
      newTask.startTime = taskData.startTime;
      
      // If only start time is provided, set end time to 30 minutes later by default
      if (!taskData.endTime) {
        const endTimeDate = addMinutes(new Date(taskData.startTime), 30);
        newTask.endTime = endTimeDate.toISOString();
      } else {
        newTask.endTime = taskData.endTime;
      }
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.dueDate,
          start_time: newTask.startTime,
          end_time: newTask.endTime,
          completed: newTask.completed,
          user_id: user!.id,
        }])
        .select();

      if (error) {
        console.error('Error saving task:', error);
        return;
      }

      setTasks(prevTasks => [...prevTasks, data![0] as Task]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedTaskData: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTaskData)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updatedTaskData } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSyncTasks = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    setSyncing(true);
    try {
      // Extract task IDs from the current tasks state
      const taskIds = tasks.map(task => task.id);

      const { error } = await invokeSyncFunction('sync-tasks-to-calendar', {
        userId: user.id,
        taskIds: taskIds,
      });

      if (error) {
        console.error('Sync failed:', error);
      } else {
        console.log('Sync successful');
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Mapping function to convert database tasks to TaskProps
  function mapDbTaskToTaskProps(task: Task): TaskProps {
    return {
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      priority: (task.priority as 'low' | 'medium' | 'high') || 'medium',
      dueDate: task.dueDate || new Date().toISOString(),
      completed: task.completed,
      tags: [],
      startTime: task.startTime || undefined,
      endTime: task.endTime || undefined
    };
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task List</h1>
        <div className="flex gap-2">
          <ButtonCustom
            variant="secondary"
            onClick={handleSyncTasks}
            disabled={syncing}
            icon={<RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />}
          >
            {syncing ? 'Syncing...' : 'Sync to Calendar'}
          </ButtonCustom>
          <ButtonCustom variant="primary" onClick={toggleCreateModal}>
            Create Task
          </ButtonCustom>
        </div>
      </div>

      <Tab.Group
        selectedIndex={currentTab === 'list' ? 0 : 1}
        onChange={(index) => setCurrentTab(index === 0 ? 'list' : 'calendar')}
      >
        <Tab.List className="flex space-x-4 mb-4">
          <Tab
            className={({ selected }) =>
              cn(
                'rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary',
                selected
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )
            }
          >
            List View
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                'rounded-md py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary',
                selected
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )
            }
          >
            Calendar View
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <TaskList
              onTaskEdited={() => {}}
              onTaskDeleted={() => {}}
            />
          </Tab.Panel>
          <Tab.Panel>
            <WeekView
              currentDate={new Date()}
              selectedDate={selectedDate}
              tasks={tasks.map(mapDbTaskToTaskProps)}
              onPreviousWeek={() => {}}
              onNextWeek={() => {}}
              onToday={() => {}}
              onSelectDay={setSelectedDate}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={toggleCreateModal}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;
