import { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import WeekView from '@/components/tasks/WeekView';
import { useTaskFiltering } from '@/hooks/use-task-filtering';
import { TaskDateGroups, useTaskDateGroups } from '@/hooks/use-task-date-groups';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Tab } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { invokeSyncFunction } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { addMinutes } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  const { filteredTasks, filterTasks } = useTaskFiltering(tasks);
  const { taskDateGroups, groupTasksByDate } = useTaskDateGroups(filteredTasks);
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

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    groupTasksByDate(filteredTasks);
  }, [filteredTasks, groupTasksByDate]);

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  const handleCreateTask = async (taskData: any) => {
    console.log('Creating task with data:', taskData);
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: new Date(taskData.dueDate),
      completed: false,
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
          ...newTask,
          user_id: user!.id,
        }])
        .select()

      if (error) {
        console.error('Error saving task:', error);
        return;
      }

      setTasks(prevTasks => [...prevTasks, data![0]]);
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

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task List</h1>
        <div className="flex gap-2">
          <ButtonCustom
            variant="secondary"
            onClick={handleSyncTasks}
            disabled={syncing}
            icon={<RefreshCw className="h-4 w-4 animate-spin" />}
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
              loading={loading}
              tasks={taskDateGroups}
              filterTasks={filterTasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </Tab.Panel>
          <Tab.Panel>
            <WeekView
              tasks={tasks}
              loading={loading}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={toggleCreateModal}
        onCreate={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;
