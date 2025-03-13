
import React from 'react';
import { format } from 'date-fns';
import { TaskProps } from './types';
import TaskCard from './TaskCard';

interface TaskSectionProps {
  title: string;
  tasks: TaskProps[];
  sortOption: string;
  selectedDate?: Date;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const TaskSection = ({ 
  title, 
  tasks, 
  sortOption,
  selectedDate,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd
}: TaskSectionProps) => {
  // Format the selected date for display if provided
  const getSelectedDateDisplay = () => {
    if (!selectedDate) return title;
    
    const day = format(selectedDate, 'd');
    const month = format(selectedDate, 'MMM');
    const dayName = format(selectedDate, 'EEEE');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = selectedDate.getTime() === today.getTime();
    
    return `${day} ${month} · ${isToday ? 'Today' : ''} · ${dayName}`;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {selectedDate ? getSelectedDateDisplay() : title}
      </h2>
      
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id}
              draggable={sortOption === 'custom'}
              onDragStart={(e) => sortOption === 'custom' && handleDragStart(e, task.id)}
              onDragOver={(e) => sortOption === 'custom' && handleDragOver(e)}
              onDragLeave={(e) => sortOption === 'custom' && handleDragLeave(e)}
              onDrop={(e) => sortOption === 'custom' && handleDrop(e, task.id)}
              onDragEnd={(e) => sortOption === 'custom' && handleDragEnd(e)}
              className={sortOption === 'custom' ? 'cursor-move' : ''}
            >
              <TaskCard {...task} />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks scheduled for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSection;
