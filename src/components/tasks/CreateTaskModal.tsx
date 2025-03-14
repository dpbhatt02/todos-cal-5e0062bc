
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import TaskModalHeader from './modal/TaskModalHeader';
import TaskFormBasicFields from './modal/TaskFormBasicFields';
import TaskRecurringControls from './modal/TaskRecurringControls';
import TaskTagSelector from './modal/TaskTagSelector';
import TaskModalFooter from './modal/TaskModalFooter';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  editMode?: boolean;
  initialData?: any;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultTaskData = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: formatDate(new Date()),
  startTime: '09:00',
  endTime: '10:00',
  tags: [] as string[],
  recurring: 'none',
  recurrenceEndType: 'never',
  recurrenceEndDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  recurrenceCount: 5,
  selectedWeekdays: [] as string[]
};

const availableTags = [
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'health', label: 'Health' },
  { id: 'learning', label: 'Learning' }
];

const CreateTaskModal = ({ isOpen, onClose, onSubmit, editMode = false, initialData = {} }: CreateTaskModalProps) => {
  const [taskData, setTaskData] = useState({
    ...defaultTaskData,
    ...(editMode && initialData ? initialData : {})
  });

  // Reset data when modal opens or closes or when initialData changes
  useEffect(() => {
    if (isOpen) {
      setTaskData({
        ...defaultTaskData,
        ...(editMode && initialData ? initialData : {})
      });
    }
  }, [isOpen, editMode, initialData]);

  useEffect(() => {
    // Set focus when modal opens
    if (isOpen) {
      setTimeout(() => {
        const input = document.getElementById('title');
        if (input) input.focus();
      }, 100);
    }
  }, [isOpen]);

  // Event handlers for form fields
  const handleTitleChange = (value: string) => {
    setTaskData(prev => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setTaskData(prev => ({ ...prev, description: value }));
  };

  const handleDueDateChange = (value: string) => {
    setTaskData(prev => ({ ...prev, dueDate: value }));
  };

  const handlePriorityChange = (value: string) => {
    setTaskData(prev => ({ ...prev, priority: value }));
  };

  const handleStartTimeChange = (value: string) => {
    setTaskData(prev => ({ ...prev, startTime: value }));
  };

  const handleEndTimeChange = (value: string) => {
    setTaskData(prev => ({ ...prev, endTime: value }));
  };

  const handleRecurringChange = (value: string) => {
    setTaskData(prev => ({ 
      ...prev, 
      recurring: value,
      selectedWeekdays: value === 'custom' ? prev.selectedWeekdays : []
    }));
  };

  const handleWeekdayToggle = (weekdayId: string) => {
    setTaskData(prev => {
      const currentWeekdays = [...prev.selectedWeekdays];
      if (currentWeekdays.includes(weekdayId)) {
        return { ...prev, selectedWeekdays: currentWeekdays.filter(id => id !== weekdayId) };
      } else {
        return { ...prev, selectedWeekdays: [...currentWeekdays, weekdayId] };
      }
    });
  };

  const handleRecurrenceEndTypeChange = (type: string) => {
    setTaskData(prev => ({ ...prev, recurrenceEndType: type }));
  };

  const handleRecurrenceEndDateChange = (date: string) => {
    setTaskData(prev => ({ ...prev, recurrenceEndDate: date }));
  };

  const handleRecurrenceCountChange = (count: number) => {
    setTaskData(prev => ({ ...prev, recurrenceCount: count }));
  };

  const handleTagToggle = (tagId: string) => {
    setTaskData(prev => {
      const currentTags = [...prev.tags];
      if (currentTags.includes(tagId)) {
        return { ...prev, tags: currentTags.filter(id => id !== tagId) };
      } else {
        return { ...prev, tags: [...currentTags, tagId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Submitting task data:", taskData);
    onSubmit(taskData);
    onClose();
  };

  // Use solid color backgrounds that blend white with priority colors
  const getPriorityBackgroundColor = () => {
    switch (taskData.priority) {
      case 'low':
        return '#F0FAF0'; // Light green + white blend
      case 'medium':
        return '#FFF8E8'; // Light amber + white blend
      case 'high':
        return '#FFF0F0'; // Light red + white blend
      default:
        return '#FFFFFF'; // Pure white
    }
  };

  const getPriorityBorderColor = () => {
    switch (taskData.priority) {
      case 'low':
        return 'border-priority-low';
      case 'medium':
        return 'border-priority-medium';
      case 'high':
        return 'border-priority-high';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden animate-in fade-in border-l-4 ${getPriorityBorderColor()}`}
        style={{ backgroundColor: getPriorityBackgroundColor() }}
        onClick={(e) => e.stopPropagation()}
      >
        <TaskModalHeader 
          title={editMode ? 'Edit Task' : 'New Task'} 
          onClose={onClose} 
        />
        
        <form 
          onSubmit={handleSubmit} 
          className="overflow-y-auto max-h-[calc(90vh-8rem)]"
        >
          <div className="p-6 space-y-4">
            <TaskFormBasicFields 
              title={taskData.title}
              description={taskData.description}
              dueDate={taskData.dueDate}
              priority={taskData.priority}
              startTime={taskData.startTime}
              endTime={taskData.endTime}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              onDueDateChange={handleDueDateChange}
              onPriorityChange={handlePriorityChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
            />

            <TaskRecurringControls
              recurring={taskData.recurring}
              selectedWeekdays={taskData.selectedWeekdays}
              recurrenceEndType={taskData.recurrenceEndType}
              recurrenceEndDate={taskData.recurrenceEndDate}
              recurrenceCount={taskData.recurrenceCount}
              dueDate={taskData.dueDate}
              onRecurringChange={handleRecurringChange}
              onWeekdayToggle={handleWeekdayToggle}
              onRecurrenceEndTypeChange={handleRecurrenceEndTypeChange}
              onRecurrenceEndDateChange={handleRecurrenceEndDateChange}
              onRecurrenceCountChange={handleRecurrenceCountChange}
            />
            
            <Separator />
            
            <TaskTagSelector
              availableTags={availableTags}
              selectedTags={taskData.tags}
              onToggleTag={handleTagToggle}
            />
          </div>
          
          <TaskModalFooter onClose={onClose} isEditMode={editMode} />
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
