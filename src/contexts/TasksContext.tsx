
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TaskProps } from '@/components/tasks/types';
import { TaskService } from '@/services/TaskService';
import { toast } from 'sonner';

interface TasksContextType {
  tasks: TaskProps[];
  isLoading: boolean;
  error: string | null;
  customOrder: string[];
  isOverdueOpen: boolean;
  setIsOverdueOpen: (value: boolean) => void;
  setCustomOrder: (value: string[]) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  createTask: (task: Omit<TaskProps, 'id'>) => Promise<TaskProps>;
  updateTask: (taskId: string, updates: Partial<TaskProps>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  rescheduleTask: (taskId: string, newDate: Date) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

interface TasksProviderProps {
  children: React.ReactNode;
  initialTasks?: TaskProps[];
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ 
  children, 
  initialTasks = [] 
}) => {
  const [tasks, setTasks] = useState<TaskProps[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  const [customOrder, setCustomOrder] = useState<string[]>(initialTasks.map(task => task.id));

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const fetchedTasks = await TaskService.getTasks();
        setTasks(fetchedTasks);
        setCustomOrder(fetchedTasks.map(task => task.id));
        setError(null);
      } catch (err) {
        setError('Failed to fetch tasks');
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Create a new task
  const createTask = async (task: Omit<TaskProps, 'id'>): Promise<TaskProps> => {
    try {
      const newTask = await TaskService.createTask(task);
      setTasks(prevTasks => [...prevTasks, newTask]);
      setCustomOrder(prevOrder => [...prevOrder, newTask.id]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<TaskProps>): Promise<void> => {
    try {
      await TaskService.updateTask(taskId, updates);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setCustomOrder(prevOrder => prevOrder.filter(id => id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Reschedule a task
  const rescheduleTask = async (taskId: string, newDate: Date): Promise<void> => {
    try {
      await TaskService.rescheduleTask(taskId, newDate);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, dueDate: newDate } : task
        )
      );
    } catch (error) {
      console.error('Error rescheduling task:', error);
      throw error;
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-muted/30');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-muted/30');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-muted/30');
    
    const draggedTaskId = e.dataTransfer.getData('text/plain');
    if (draggedTaskId === taskId) return;
    
    const newOrder = [...customOrder];
    const draggedIndex = newOrder.indexOf(draggedTaskId);
    const dropIndex = newOrder.indexOf(taskId);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedTaskId);
    
    setCustomOrder(newOrder);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <TasksContext.Provider value={{
      tasks,
      isLoading,
      error,
      customOrder,
      isOverdueOpen,
      setIsOverdueOpen,
      setCustomOrder,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      createTask,
      updateTask,
      deleteTask,
      rescheduleTask
    }}>
      {children}
    </TasksContext.Provider>
  );
};
