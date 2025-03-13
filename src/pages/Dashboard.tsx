
import { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import TaskCard, { TaskProps } from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { useNavigate } from 'react-router-dom';

// Sample data for demonstration
const mockTasks: TaskProps[] = [
  {
    id: '1',
    title: 'Finalize project proposal',
    description: 'Complete the final draft of the project proposal with all required sections.',
    priority: 'high',
    dueDate: '2023-09-20',
    completed: false,
    tags: ['work']
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up a team meeting to discuss the upcoming sprint goals and assignments.',
    priority: 'medium',
    dueDate: '2023-09-21',
    completed: false,
    tags: ['work']
  },
  {
    id: '3',
    title: 'Gym workout',
    description: 'Complete 30-minute cardio and strength training session.',
    priority: 'low',
    dueDate: '2023-09-19',
    completed: true,
    tags: ['health', 'personal']
  }
];

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate task stats
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(task => task.completed).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = mockTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && !task.completed;
  });

  // Get high priority tasks
  const highPriorityTasks = mockTasks.filter(task => 
    task.priority === 'high' && !task.completed
  );

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    // In a real app, you would dispatch an action or call an API
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your tasks.</p>
        </div>
        
        <ButtonCustom 
          variant="primary"
          className="self-start md:self-center rounded-full"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Task
        </ButtonCustom>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-background border border-border/50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</h3>
          <p className="text-2xl font-semibold mb-2">{completionRate}%</p>
          <Progress value={completionRate} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        
        <div className="bg-background border border-border/50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Today</h3>
          <p className="text-2xl font-semibold mb-2">{todayTasks.length}</p>
          <div className="h-2 bg-muted/50 rounded-full mb-2">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(todayTasks.length / (totalTasks || 1)) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {todayTasks.length} tasks due today
          </p>
        </div>
        
        <div className="bg-background border border-border/50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">High Priority</h3>
          <p className="text-2xl font-semibold mb-2">{highPriorityTasks.length}</p>
          <div className="h-2 bg-muted/50 rounded-full mb-2">
            <div 
              className="h-full bg-priority-high rounded-full"
              style={{ width: `${(highPriorityTasks.length / (totalTasks || 1)) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {highPriorityTasks.length} high priority tasks
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-background border border-border/50 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <h2 className="font-medium">Today's Tasks</h2>
            <ButtonCustom 
              variant="ghost" 
              size="sm"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              onClick={() => navigate('/tasks')}
            >
              View All
            </ButtonCustom>
          </div>
          <div className="p-4 space-y-2">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <TaskCard key={task.id} {...task} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks due today.</p>
                <ButtonCustom 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create a Task
                </ButtonCustom>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-background border border-border/50 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <h2 className="font-medium">High Priority</h2>
            <ButtonCustom 
              variant="ghost" 
              size="sm"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              onClick={() => navigate('/tasks')}
            >
              View All
            </ButtonCustom>
          </div>
          <div className="p-4 space-y-2">
            {highPriorityTasks.length > 0 ? (
              highPriorityTasks.map(task => (
                <TaskCard key={task.id} {...task} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No high priority tasks.</p>
                <ButtonCustom 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create a Task
                </ButtonCustom>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Dashboard;
