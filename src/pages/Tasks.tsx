import { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useTasksContext } from '@/contexts/TasksContext';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Plus, RefreshCw } from 'lucide-react';
import { TaskProps } from '@/components/tasks/types';
import { TasksProvider } from '@/contexts/TasksContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';

// Define a simple interface for sync settings
interface CalendarSyncSettings {
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number;
  days_past: number;
  days_future: number;
  last_synced_at?: string;
}

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
  const { user } = useAuth();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const initialSyncRef = useRef(false);
  
  // Check for auto-sync settings and set up periodic sync if enabled
  useEffect(() => {
    if (!user || !isCalendarConnected) return;
    
    let syncInterval: number | null = null;
    
    const checkAutoSyncSettings = async () => {
      try {
        const { data, error } = await supabase.rpc(
          'get_calendar_sync_settings', 
          { user_id_param: user.id }
        );
          
        if (error) {
          console.error('Error fetching auto-sync settings:', error);
          return;
        }
        
        console.log('Auto-sync settings:', data);
        setAutoSyncEnabled(data?.auto_sync_enabled || false);
        
        if (data && data.auto_sync_enabled) {
          // Clear any existing interval
          if (syncInterval) {
            clearInterval(syncInterval);
          }
          
          // Set up new interval based on settings
          const minutes = data.sync_frequency_minutes || 30;
          const milliseconds = minutes * 60 * 1000;
          
          console.log(`Setting up auto-sync every ${minutes} minutes`);
          
          // Only perform an initial sync if it hasn't been done
          if (!initialSyncRef.current) {
            await synchronizeWithCalendar();
            initialSyncRef.current = true;
          }
          
          // Set up the interval for future syncs
          syncInterval = window.setInterval(() => {
            console.log('Auto-sync triggered by interval');
            synchronizeWithCalendar();
          }, milliseconds);
        }
      } catch (err) {
        console.error('Error setting up auto-sync:', err);
      }
    };
    
    checkAutoSyncSettings();
    
    // Clean up the interval when the component unmounts
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [user, isCalendarConnected, synchronizeWithCalendar]);

  // Sync on page load/refresh only once
  useEffect(() => {
    if (user && isCalendarConnected && !initialSyncRef.current) {
      // Sync on component mount (page load/refresh) only if not already done
      synchronizeWithCalendar();
      initialSyncRef.current = true;
    }
  }, [user, isCalendarConnected, synchronizeWithCalendar]);

  // Debounced sync after operations occur
  useEffect(() => {
    if (lastOperation && user && isCalendarConnected) {
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
      
      // Set a new timeout to trigger sync after a short delay
      // This debounces multiple rapid changes
      syncTimeoutRef.current = window.setTimeout(() => {
        console.log('Debounced sync triggered by operation:', lastOperation);
        synchronizeWithCalendar();
        setLastOperation(null);
        syncTimeoutRef.current = null;
      }, 3000); // 3 second debounce
    }
    
    // Clean up on unmount
    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [lastOperation, user, isCalendarConnected, synchronizeWithCalendar]);

  const handleCreateTask = async (taskData: any) => {
    // Convert the data to the format expected by the createTask function
    const formattedData: Partial<TaskProps> = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority,
      dueDate: new Date(taskData.dueDate),
      completed: false,
    };

    // Add time information using the UTC formatted strings from the form
    if (taskData.startTimeUtc) {
      formattedData.startTime = taskData.startTime; // Keep the display time
      formattedData.startTimeUtc = taskData.startTimeUtc; // Add the UTC time
    } else if (taskData.startTime) {
      formattedData.startTime = taskData.startTime;
    }
    
    if (taskData.endTimeUtc) {
      formattedData.endTime = taskData.endTime; // Keep the display time
      formattedData.endTimeUtc = taskData.endTimeUtc; // Add the UTC time
    } else if (taskData.endTime) {
      formattedData.endTime = taskData.endTime;
    }
    
    if (taskData.isAllDay !== undefined) {
      formattedData.isAllDay = taskData.isAllDay;
    }

    // Include recurring data if present
    if (taskData.recurring && taskData.recurring !== 'none') {
      formattedData.recurring = {
        frequency: taskData.recurring as 'daily' | 'weekly' | 'monthly' | 'custom',
        customDays: taskData.selectedWeekdays || []
      };

      // Add end date or count if specified
      if (taskData.recurrenceEndType === 'date' && taskData.recurrenceEndDate) {
        formattedData.recurring.endDate = new Date(taskData.recurrenceEndDate);
      } else if (taskData.recurrenceEndType === 'after' && taskData.recurrenceCount) {
        formattedData.recurring.endAfter = taskData.recurrenceCount;
      }
    }

    console.log('Formatted task data:', formattedData);
    
    const newTask = await createTask(formattedData as Omit<TaskProps, 'id'>);
    setIsCreateModalOpen(false);
    
    // Set last operation to trigger sync
    if (newTask) {
      setLastOperation('create');
    }
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
                    onClick={() => {
                      console.log('Manual sync button clicked');
                      synchronizeWithCalendar();
                    }}
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
      <TaskList 
        onTaskEdited={() => setLastOperation('edit')}
        onTaskDeleted={() => setLastOperation('delete')}
      />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Tasks;
