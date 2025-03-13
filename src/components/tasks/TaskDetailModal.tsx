
import React from 'react';
import { Check, Edit, Trash, X, Calendar, Tag, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ButtonCustom } from '@/components/ui/button-custom';
import { cn } from '@/lib/utils';
import { TaskProps } from './TaskCard';

interface TaskDetailModalProps {
  task: TaskProps;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onComplete,
  onEdit,
  onDelete
}: TaskDetailModalProps) => {
  const priorityLabels = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority'
  };

  const priorityColors = {
    low: 'bg-priority-low text-green-700',
    medium: 'bg-priority-medium text-amber-700',
    high: 'bg-priority-high text-red-700'
  };

  const tagColors: Record<string, string> = {
    work: 'bg-blue-100 text-blue-700',
    personal: 'bg-purple-100 text-purple-700',
    health: 'bg-green-100 text-green-700',
    learning: 'bg-amber-100 text-amber-700',
    meeting: 'bg-red-100 text-red-700'
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display (16:00 -> 4:00 PM)
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Create time range display if both start and end times exist
  const timeDisplay = task.startTime && task.endTime 
    ? `${formatTime(task.startTime)} - ${formatTime(task.endTime)}`
    : '';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="sr-only">Task details</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: task.description }} />
            </div>
          )}
          
          {/* Task metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h3>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {formatDate(task.dueDate)}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
              <div className="flex items-center">
                <div className={cn(
                  "h-2 w-2 rounded-full mr-2",
                  `bg-priority-${task.priority}`
                )} />
                <span className="text-sm">{priorityLabels[task.priority]}</span>
              </div>
            </div>
          </div>
          
          {/* Time duration */}
          {timeDisplay && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Time</h3>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{timeDisplay}</span>
              </div>
            </div>
          )}
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <div 
                    key={tag}
                    className={cn(
                      "flex items-center text-xs px-2 py-1 rounded-full",
                      tagColors[tag] || "bg-gray-100 text-gray-700"
                    )}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs",
              task.completed 
                ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-500" 
                : "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-500"
            )}>
              {task.completed ? "Completed" : "Active"}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={onDelete}
              icon={<Trash className="h-4 w-4" />}
            >
              Delete
            </ButtonCustom>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={onEdit}
              icon={<Edit className="h-4 w-4" />}
            >
              Edit
            </ButtonCustom>
          </div>
          
          <ButtonCustom
            variant="primary"
            size="sm"
            onClick={onComplete}
            icon={<Check className="h-4 w-4" />}
          >
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </ButtonCustom>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
