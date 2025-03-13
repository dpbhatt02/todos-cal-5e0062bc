
import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Separator } from '@/components/ui/separator';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/components/ui/toggle-group';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
}

const CreateTaskModal = ({ isOpen, onClose, onSubmit }: CreateTaskModalProps) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: formatDate(new Date()),
    startTime: '',
    endTime: '',
    tags: [] as string[]
  });

  const availableTags = [
    { id: 'work', label: 'Work' },
    { id: 'personal', label: 'Personal' },
    { id: 'health', label: 'Health' },
    { id: 'learning', label: 'Learning' },
    { id: 'meeting', label: 'Meeting' }
  ];

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
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
    onSubmit(taskData);
    // Reset form
    setTaskData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: formatDate(new Date()),
      startTime: '',
      endTime: '',
      tags: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="What needs to be done?"
                value={taskData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add details about this task..."
                value={taskData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={taskData.dueDate}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <ToggleGroup 
                  type="single" 
                  value={taskData.priority}
                  onValueChange={(value) => {
                    if (value) setTaskData(prev => ({ ...prev, priority: value }));
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="low" aria-label="Low priority">
                    <span className="h-2 w-2 rounded-full bg-priority-low mr-1.5"></span>
                    Low
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Medium priority">
                    <span className="h-2 w-2 rounded-full bg-priority-medium mr-1.5"></span>
                    Med
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" aria-label="High priority">
                    <span className="h-2 w-2 rounded-full bg-priority-high mr-1.5"></span>
                    High
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            
            {/* Time duration fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time (Optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={taskData.startTime}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={taskData.endTime}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      taskData.tags.includes(tag.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/70 hover:bg-muted'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
            <ButtonCustom 
              type="button" 
              variant="ghost" 
              onClick={onClose}
            >
              Cancel
            </ButtonCustom>
            <ButtonCustom 
              type="submit" 
              variant="primary"
            >
              Create Task
            </ButtonCustom>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
