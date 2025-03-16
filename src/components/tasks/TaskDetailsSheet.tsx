
import React from 'react';
import { Calendar, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskProps, priorityClasses, tagColors } from './types';
import { formatFullDate, getRecurringLabel } from './utils';

interface TaskDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskProps;
}

const TaskDetailsSheet = ({ isOpen, onClose, task }: TaskDetailsSheetProps) => {
  const { title, description, priority, dueDate, recurring, tags = [] } = task;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Task Details
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Priority</h3>
            <div className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", priorityClasses[priority] || priorityClasses.default)} />
              <span className="text-sm capitalize">{priority}</span>
            </div>
          </div>

          {description && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-sm font-medium">Due Date</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatFullDate(dueDate)}
              </span>
            </div>
          </div>

          {recurring && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Recurrence</h3>
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {getRecurringLabel(recurring.frequency as 'daily' | 'weekly' | 'monthly' | 'custom')}
                </span>
              </div>
              {recurring.endDate && (
                <p className="text-xs text-muted-foreground">
                  Ends on {formatFullDate(recurring.endDate)}
                </p>
              )}
              {recurring.endAfter && (
                <p className="text-xs text-muted-foreground">
                  Ends after {recurring.endAfter} occurrences
                </p>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div 
                    key={tag}
                    className="flex items-center text-xs px-2 py-1 bg-muted rounded-full"
                  >
                    <span 
                      className={cn("h-2 w-2 rounded-full mr-1.5", tagColors[tag] || tagColors.default)}
                    />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailsSheet;
