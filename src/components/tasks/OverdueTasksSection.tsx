
import React from 'react';
import { ChevronRight, RefreshCcw } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { TaskProps } from './types';
import TaskCard from './TaskCard';

interface OverdueTasksSectionProps {
  tasks: TaskProps[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  sortOption: string;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const OverdueTasksSection = ({ 
  tasks, 
  isOpen, 
  onOpenChange, 
  selectedDate,
  sortOption,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd
}: OverdueTasksSectionProps) => {
  
  const rescheduleAllOverdueTasks = (date: Date) => {
    // In a real app, you would call an API to update all overdue tasks
    // For this mock, we'll just show a toast notification
    toast({
      title: "Tasks rescheduled",
      description: `${tasks.length} overdue tasks rescheduled to ${format(date, 'PPP')}`,
    });
  };

  if (tasks.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="flex items-center w-full justify-between text-left mb-3">
        <CollapsibleTrigger className="flex items-center">
          <ChevronRight className={`h-5 w-5 mr-2 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          <span className="text-md font-medium text-destructive">Overdue</span>
          <span className="ml-2 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
            {tasks.length}
          </span>
        </CollapsibleTrigger>
        <Popover>
          <PopoverTrigger asChild>
            <ButtonCustom
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              Reschedule
            </ButtonCustom>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium mb-2">Reschedule all overdue tasks to:</h3>
              <ButtonCustom 
                variant="outline" 
                size="sm" 
                className="justify-start"
                type="button"
                onClick={() => rescheduleAllOverdueTasks(new Date())}
              >
                Today
              </ButtonCustom>
              <ButtonCustom 
                variant="outline" 
                size="sm" 
                className="justify-start"
                type="button"
                onClick={() => rescheduleAllOverdueTasks(addDays(new Date(), 1))}
              >
                Tomorrow
              </ButtonCustom>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Or pick a specific date:</p>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && rescheduleAllOverdueTasks(date)}
                  initialFocus
                  className="pointer-events-auto border rounded-md"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <CollapsibleContent>
        <div className="space-y-2 ml-7">
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default OverdueTasksSection;
