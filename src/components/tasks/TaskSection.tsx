
import React from 'react';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import { formatFullDate } from './utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Format the selected date for display if provided
  const getSelectedDateDisplay = () => {
    if (!selectedDate) return title;
    
    return formatFullDate(selectedDate);
  };

  return (
    <div>
      <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold ${isMobile ? 'mb-2' : 'mb-4'}`}>
        {selectedDate ? getSelectedDateDisplay() : title}
      </h2>
      
      <div className="space-y-1.5 sm:space-y-2">
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
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No tasks scheduled for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSection;
