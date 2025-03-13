import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus 
} from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { TaskProps } from '@/components/tasks/TaskCard';
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
    completed: true,
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

const Calendar = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleCreateTask = (taskData: any) => {
    console.log('New task created:', taskData);
    // In a real app, you would dispatch an action or call an API
  };

  // Calendar navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Generate calendar data
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Create calendar grid
  const days = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fill in blanks for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Fill in the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  // Get tasks for selected date
  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    const formattedDate = date.toISOString().split('T')[0];
    return mockTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toISOString().split('T')[0] === formattedDate;
    });
  };

  const selectedTasks = getTasksForDate(selectedDate);

  // Determine if a date has tasks
  const hasTasksOnDate = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return mockTasks.some(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toISOString().split('T')[0] === formattedDate;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const priorityColors = {
    'low': 'bg-priority-low',
    'medium': 'bg-priority-medium',
    'high': 'bg-priority-high'
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        {/* Removed New Task button from here */}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium">{monthNames[month]} {year}</h2>
        <div className="flex items-center gap-2">
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            onClick={prevMonth}
            icon={<ChevronLeft className="h-5 w-5" />}
            aria-label="Previous month"
          />
          <ButtonCustom 
            variant="ghost" 
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </ButtonCustom>
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            onClick={nextMonth}
            icon={<ChevronRight className="h-5 w-5" />}
            aria-label="Next month"
          />
        </div>
      </div>

      <div className="bg-background border border-border/50 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border/40">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 h-[600px]">
          {days.map((day, index) => (
            <div
              key={index}
              className={`border border-border/40 p-1 min-h-[100px] ${
                day === null ? 'bg-muted/20' : ''
              }`}
            >
              {day !== null && (
                <div 
                  className={`h-full flex flex-col ${
                    selectedDate && 
                    selectedDate.getDate() === day.getDate() && 
                    selectedDate.getMonth() === day.getMonth() &&
                    selectedDate.getFullYear() === day.getFullYear()
                      ? 'ring-2 ring-primary/30 rounded-md'
                      : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`p-1 flex justify-center items-center ${
                    day.getTime() === today.getTime() 
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 mx-auto'
                      : ''
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  {hasTasksOnDate(day) && (
                    <div className="mt-1 px-1 space-y-1 overflow-y-auto flex-1">
                      {getTasksForDate(day).slice(0, 3).map(task => (
                        <div 
                          key={task.id} 
                          className="text-xs p-1 rounded bg-muted/50 truncate border-l-2 border-l-primary cursor-pointer hover:bg-muted"
                        >
                          {task.title}
                        </div>
                      ))}
                      
                      {getTasksForDate(day).length > 3 && (
                        <div className="text-xs text-muted-foreground p-1 text-center">
                          +{getTasksForDate(day).length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 bg-background border border-border/50 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h3 className="font-medium">{selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h3>
          </div>
          
          <div className="p-4">
            {selectedTasks.length > 0 ? (
              <div className="space-y-2">
                {selectedTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-3 rounded-md border border-border/40 ${
                      task.completed ? 'bg-muted/30 opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-3 w-3 rounded-full mt-1 ${priorityColors[task.priority]}`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="text-xs px-2 py-0.5 bg-muted rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No tasks for this date.</p>
                {/* Keep only this Create a Task button since it's contextual for empty days */}
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
      )}
      
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Calendar;
