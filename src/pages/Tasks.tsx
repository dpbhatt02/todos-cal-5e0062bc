import { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useTasksContext } from '@/contexts/TasksContext';
import { TaskProps } from '@/components/tasks/types';
import { TasksProvider } from '@/contexts/TasksContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

  if (!user) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your tasks.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </button>
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
  const [selectedTaskDate, setSelectedTaskDate] = useState<Date | undefined>(undefined);
  
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

    // Add time information if present - ensuring correct time formats
    if (taskData.startTime) {
      formattedData.startTime = taskData.startTime; // Time already converted in CreateTaskModal
      
      // If only start time is provided, the backend will automatically set 
      // end time to start time + 30 minutes
      if (taskData.endTime) { // Both start and end time provided
        formattedData.endTime = taskData.endTime; // Time already converted in CreateTaskModal
      }
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
    setSelectedTaskDate(undefined); // Reset selected date after task creation
    
    // Set last operation to trigger sync
    if (newTask) {
      setLastOperation('create');
    }
  };

  const handleSyncCalendar = () => {
    console.log('Manual sync button clicked');
    synchronizeWithCalendar();
  };

  // Updated to accept a date parameter and store it
  const openCreateTaskModal = (date?: Date) => {
    console.log('Opening create task modal with date:', date);
    if (date) {
      console.log('Date ISO string:', date.toISOString());
      console.log('Formatted date:', formatDate(date));
    }
    setSelectedTaskDate(date);
    setIsCreateModalOpen(true);
  };

  // Handler for closing the modal (also reset selected date)
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedTaskDate(undefined); // Reset date when closing modal
  };

  return (
    <div className={`container ${isMobile ? 'px-2 sm:px-4' : 'py-6'}`}>
      <TaskList 
        onTaskEdited={() => setLastOperation('edit')}
        onTaskDeleted={() => setLastOperation('delete')}
        onCreateTask={openCreateTaskModal}
        onSyncCalendar={handleSyncCalendar}
        syncing={syncing}
        isCalendarConnected={isCalendarConnected}
      />
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateTask}
        initialData={selectedTaskDate ? { dueDate: formatDate(selectedTaskDate) } : {}}
        key={selectedTaskDate ? selectedTaskDate.toISOString() : 'default'} // Add key to force re-render with fresh state
      />
    </div>
  );
};

// Helper function to format date to YYYY-MM-DD
function formatDate(date: Date) {
  console.log('Formatting date:', date);
  const formatted = format(date, 'yyyy-MM-dd');
  console.log('Formatted result:', formatted);
  return formatted;
}

export default Tasks;
