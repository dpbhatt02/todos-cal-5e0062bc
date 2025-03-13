
import { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import TaskCard from '@/components/tasks/TaskCard';
import { TaskProps } from '@/components/tasks/types';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';

// Sample tasks data for demonstration
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
    completed: false,
    tags: ['health', 'personal']
  },
  {
    id: '4',
    title: 'Read book chapter',
    description: 'Read chapter 5 of "Atomic Habits" and take notes.',
    priority: 'medium',
    dueDate: '2023-09-22',
    completed: false,
    tags: ['learning', 'personal']
  },
  {
    id: '5',
    title: 'Pay utility bills',
    description: 'Pay electricity, water, and internet bills before the due date.',
    priority: 'high',
    dueDate: '2023-09-19',
    completed: false,
    tags: ['personal']
  }
];

const Kanban = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    // In a real app, you would dispatch an action or call an API
  };

  // Define kanban columns
  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-blue-500' },
    { id: 'inProgress', title: 'In Progress', color: 'border-amber-500' },
    { id: 'completed', title: 'Completed', color: 'border-green-500' }
  ];

  // Distribute tasks among columns (in a real app, this would be based on task status)
  const columnTasks = {
    todo: mockTasks.slice(0, 2),
    inProgress: mockTasks.slice(2, 4),
    completed: [{ ...mockTasks[4], completed: true }]
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Kanban Board</h1>
        <ButtonCustom 
          variant="primary"
          className="rounded-full"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Task
        </ButtonCustom>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div 
            key={column.id}
            className={`min-w-[300px] bg-background border border-border/50 rounded-lg overflow-hidden`}
          >
            <div className={`p-4 border-b border-l-4 ${column.color} border-border/40 flex items-center justify-between`}>
              <h3 className="font-medium">{column.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {columnTasks[column.id as keyof typeof columnTasks]?.length || 0}
                </span>
                <button 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2 min-h-[200px]">
              {columnTasks[column.id as keyof typeof columnTasks]?.length > 0 ? (
                columnTasks[column.id as keyof typeof columnTasks].map(task => (
                  <TaskCard key={task.id} {...task} />
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No tasks in this column.</p>
                  <ButtonCustom 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Add a Task
                  </ButtonCustom>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Kanban;
