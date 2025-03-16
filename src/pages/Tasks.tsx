
import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useTasksContext } from '@/contexts/TasksContext';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Plus, RefreshCw, Calendar } from 'lucide-react';
import { TaskProps } from '@/components/tasks/types';
import { TasksProvider } from '@/contexts/TasksContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Tasks = () => {
  const isMobile = useIsMobile();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // We'll implement the handleCreateTask separately to avoid 
  // using useTasksContext outside of the TasksProvider
  const handleCreateTask = async (taskData: any) => {
    // For now, just a stub - the actual implementation will be inside
    // the component inside TasksProvider
    console.log('Task data received:', taskData);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your tasks.</p>
          <ButtonCustom
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </ButtonCustom>
        </div>
      </div>
    );
  }

  return (
    <TasksProvider>
      <TasksContent 
        isMobile={isMobile}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
      />
    </TasksProvider>
  );
};

// This component is inside the TasksProvider and can safely use useTasksContext
const TasksContent = ({ 
  isMobile, 
  isCreateModalOpen, 
  setIsCreateModalOpen 
}: { 
  isMobile: boolean; 
  isCreateModalOpen: boolean; 
  setIsCreateModalOpen: (isOpen: boolean) => void;
}) => {
  const { 
    createTask, 
    syncing, 
    synchronizeWithCalendar, 
    isCalendarConnected 
  } = useTasksContext();

  const handleCreateTask = async (taskData: any) => {
    // Convert the data to the format expected by the createTask function
    const formattedData: Partial<TaskProps> = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority,
      dueDate: new Date(taskData.dueDate),
      completed: false,
      tags: taskData.tags || []
    };

    // Include recurring data if present
    if (taskData.recurring && taskData.recurring !== 'none') {
      formattedData.recurring = {
        frequency: taskData.recurring,
        customDays: taskData.selectedWeekdays || []
      };

      // Add end date or count if specified
      if (taskData.recurrenceEndType === 'date' && taskData.recurrenceEndDate) {
        formattedData.recurring.endDate = new Date(taskData.recurrenceEndDate);
      } else if (taskData.recurrenceEndType === 'after' && taskData.recurrenceCount) {
        formattedData.recurring.endAfter = taskData.recurrenceCount;
      }
    }

    await createTask(formattedData as Omit<TaskProps, 'id'>);
    setIsCreateModalOpen(false);
  };

  return (
    <div className={`container ${isMobile ? 'px-2 sm:px-4' : 'py-6'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          {isCalendarConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />}
                    onClick={synchronizeWithCalendar}
                    disabled={syncing}
                  >
                    {isMobile ? "" : "Sync Calendar"}
                  </ButtonCustom>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sync with Google Calendar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <ButtonCustom
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Task
          </ButtonCustom>
        </div>
      </div>
      <TaskList />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;
