
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TaskProps } from '@/components/tasks/types';
import { useTasks as useTasksHook } from '@/hooks/use-tasks';
import { useAuth } from '@/contexts/AuthContext';

interface TasksContextType {
  tasks: TaskProps[];
  customOrder: string[];
  isOverdueOpen: boolean;
  setIsOverdueOpen: (value: boolean) => void;
  setCustomOrder: (value: string[]) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  createTask: (taskData: Omit<TaskProps, 'id'>) => Promise<TaskProps | null>;
  updateTask: (id: string, updates: Partial<TaskProps>) => Promise<TaskProps | null>;
  deleteTask: (id: string) => Promise<boolean>;
  loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

interface TasksProviderProps {
  children: React.ReactNode;
  initialTasks?: TaskProps[]; // Added for compatibility with SearchTasksSheet and TagTaskList
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ 
  children,
  initialTasks
}) => {
  const { user } = useAuth();
  const { 
    tasks: dbTasks,
    createTask,
    updateTask,
    deleteTask,
    loading
  } = useTasksHook();
  
  const [isOverdueOpen, setIsOverdueOpen] = useState(true);
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  
  // Use initialTasks if provided, otherwise use dbTasks
  const tasksToUse = initialTasks || dbTasks;

  // Update customOrder when tasks change
  useEffect(() => {
    if (tasksToUse.length > 0) {
      setCustomOrder(tasksToUse.map(task => task.id));
    }
  }, [tasksToUse]);

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
      tasks: tasksToUse,
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
      loading
    }}>
      {children}
    </TasksContext.Provider>
  );
};
