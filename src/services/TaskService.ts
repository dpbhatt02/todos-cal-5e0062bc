
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export class TaskService {
  // Convert a Supabase task to our application task format
  private static mapDbTaskToAppTask(dbTask: any): TaskProps {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      priority: dbTask.priority,
      dueDate: new Date(dbTask.due_date),
      completed: dbTask.completed,
      tags: dbTask.tags || [],
      recurring: dbTask.recurring || undefined
    };
  }

  // Convert our application task to Supabase format
  private static mapAppTaskToDbTask(task: Omit<TaskProps, 'id'> | Partial<TaskProps>): any {
    const dbTask: any = {};
    
    if (task.title !== undefined) dbTask.title = task.title;
    if (task.description !== undefined) dbTask.description = task.description;
    if (task.priority !== undefined) dbTask.priority = task.priority;
    if (task.completed !== undefined) dbTask.completed = task.completed;
    if (task.tags !== undefined) dbTask.tags = task.tags;
    if (task.recurring !== undefined) dbTask.recurring = task.recurring;
    
    // Handle date conversion for dueDate
    if (task.dueDate !== undefined) {
      if (task.dueDate instanceof Date) {
        dbTask.due_date = task.dueDate.toISOString();
      } else {
        dbTask.due_date = new Date(task.dueDate).toISOString();
      }
    }
    
    return dbTask;
  }

  // Get all tasks
  static async getTasks(): Promise<TaskProps[]> {
    try {
      console.log('Fetching tasks from Supabase');
      
      // Check if we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        console.log('No authenticated user found, using localStorage');
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched tasks from Supabase:', data);
      return (data || []).map(this.mapDbTaskToAppTask);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      
      // Fallback to localStorage if Supabase is unavailable
      console.log('Falling back to localStorage');
      const storedTasks = localStorage.getItem('tasks');
      
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        return tasks;
      }
      
      // If no stored tasks, use the initial mock data
      const { mockTasks } = await import('@/components/tasks/mockData');
      return mockTasks;
    }
  }

  // Create a new task
  static async createTask(task: Omit<TaskProps, 'id'>): Promise<TaskProps> {
    try {
      console.log('Creating new task in Supabase:', task);
      
      const dbTask = this.mapAppTaskToDbTask(task);
      
      // Add user_id from auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        dbTask.user_id = sessionData.session.user.id;
      } else {
        console.warn('No authenticated user found, task will be created without user_id');
      }
      
      // Ensure we have a timestamp for creation
      dbTask.created_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Task created in Supabase:', data);
      const newTask = this.mapDbTaskToAppTask(data);
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      
      // Fallback to localStorage
      console.log('Falling back to localStorage for task creation');
      
      // Generate a unique ID
      const newTask: TaskProps = {
        ...task,
        id: Math.random().toString(36).substring(2, 9),
      };
      
      // Get existing tasks
      const existingTasks = await this.getTasks();
      
      // Add new task
      const updatedTasks = [...existingTasks, newTask];
      
      // Save to localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      return newTask;
    }
  }

  // Update an existing task
  static async updateTask(taskId: string, updates: Partial<TaskProps>): Promise<TaskProps> {
    try {
      console.log('Updating task in Supabase:', taskId, updates);
      
      const dbUpdates = this.mapAppTaskToDbTask(updates);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Task updated in Supabase:', data);
      const updatedTask = this.mapDbTaskToAppTask(data);
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      
      // Fallback to localStorage
      console.log('Falling back to localStorage for task update');
      
      // Get existing tasks
      const tasks = await this.getTasks();
      
      // Find and update the task
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      
      // Save to localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      
      if (!updatedTask) {
        throw new Error('Task not found');
      }
      
      return updatedTask;
    }
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('Deleting task from Supabase:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
      console.log('Task deleted from Supabase');
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      
      // Fallback to localStorage
      console.log('Falling back to localStorage for task deletion');
      
      // Get existing tasks
      const tasks = await this.getTasks();
      
      // Filter out the task to delete
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      
      // Save to localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
  }
  
  // Reschedule a task
  static async rescheduleTask(taskId: string, newDate: Date): Promise<TaskProps> {
    try {
      console.log('Rescheduling task in Supabase:', taskId, 'to', newDate);
      return await this.updateTask(taskId, { dueDate: newDate });
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast.error('Failed to reschedule task');
      throw error;
    }
  }
}
