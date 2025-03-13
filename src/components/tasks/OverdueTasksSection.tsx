
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TaskProps } from './types';
import TaskCard from './TaskCard';
import { useTasks } from '@/contexts/TasksContext';

interface OverdueTasksSectionProps {
  tasks: TaskProps[];
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  selectedDate: Date;
  sortOption: string;
}

const OverdueTasksSection = ({ 
  tasks, 
  isOpen, 
  onOpenChange, 
  selectedDate,
  sortOption,
}: OverdueTasksSectionProps) => {
  const { 
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useTasks();

  // If no overdue tasks, don't render anything
  if (tasks.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center text-destructive font-semibold hover:text-destructive/80 transition-colors mb-2"
      >
        {isOpen ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
        Overdue Tasks ({tasks.length})
      </button>
      
      {isOpen && (
        <div className="space-y-1.5 sm:space-y-2 mt-2 pl-5 border-l-2 border-destructive/30">
          {tasks.map(task => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default OverdueTasksSection;
