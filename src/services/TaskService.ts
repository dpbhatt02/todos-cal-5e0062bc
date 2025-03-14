
import { TaskProps } from '@/components/tasks/types';
import { toast } from 'sonner';

export class TaskService {
  // Mock API URL - in a real app this would point to your actual API
  private static baseUrl = '/api/tasks';

  // Get all tasks
  static async getTasks(): Promise<TaskProps[]> {
    try {
      // Simulating API call - in a real app this would be a fetch to your backend
      console.log('Fetching tasks from API');
      
      // For demo purposes, we'll use localStorage to persist tasks
      const storedTasks = localStorage.getItem('tasks');
      
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        return tasks;
      }
      
      // If no stored tasks, use the initial mock data from the app
      const { mockTasks } = await import('@/components/tasks/mockData');
      
      // Store the initial data
      localStorage.setItem('tasks', JSON.stringify(mockTasks));
      
      return mockTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return [];
    }
  }

  // Create a new task
  static async createTask(task: Omit<TaskProps, 'id'>): Promise<TaskProps> {
    try {
      console.log('Creating new task:', task);
      
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
      
      toast.success('Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  }

  // Update an existing task
  static async updateTask(taskId: string, updates: Partial<TaskProps>): Promise<TaskProps> {
    try {
      console.log('Updating task:', taskId, updates);
      
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
      
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('Deleting task:', taskId);
      
      // Get existing tasks
      const tasks = await this.getTasks();
      
      // Filter out the task to delete
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      
      // Save to localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  }
  
  // Reschedule a task
  static async rescheduleTask(taskId: string, newDate: Date): Promise<TaskProps> {
    try {
      console.log('Rescheduling task:', taskId, 'to', newDate);
      return await this.updateTask(taskId, { dueDate: newDate });
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast.error('Failed to reschedule task');
      throw error;
    }
  }
}
