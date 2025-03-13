
import { useState, useRef, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Bold, Italic, Link, List, Underline, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Separator } from '@/components/ui/separator';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    startTime: '09:00',
    endTime: '10:00',
    tags: [] as string[],
    recurring: 'none'
  });

  const [textSelection, setTextSelection] = useState({
    start: 0,
    end: 0,
    text: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableTags = [
    { id: 'work', label: 'Work' },
    { id: 'personal', label: 'Personal' },
    { id: 'health', label: 'Health' },
    { id: 'learning', label: 'Learning' }
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
      startTime: '09:00',
      endTime: '10:00',
      tags: [],
      recurring: 'none'
    });
    onClose();
  };

  // Text formatting functions
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = taskData.description.substring(start, end);
      
      if (start !== end) {
        setTextSelection({
          start,
          end,
          text: selectedText
        });
      } else {
        setTextSelection({ start: 0, end: 0, text: '' });
      }
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'link' | 'list') => {
    if (textSelection.start === textSelection.end) return;

    const before = taskData.description.substring(0, textSelection.start);
    const after = taskData.description.substring(textSelection.end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${textSelection.text}**`;
        break;
      case 'italic':
        formattedText = `*${textSelection.text}*`;
        break;
      case 'underline':
        formattedText = `__${textSelection.text}__`;
        break;
      case 'link':
        formattedText = `[${textSelection.text}](url)`;
        break;
      case 'list':
        formattedText = `\n- ${textSelection.text}`;
        break;
      default:
        formattedText = textSelection.text;
    }

    setTaskData(prev => ({
      ...prev,
      description: before + formattedText + after
    }));

    // Reset selection
    setTextSelection({ start: 0, end: 0, text: '' });
  };

  // Get background color based on priority
  const getPriorityBackgroundColor = () => {
    switch (taskData.priority) {
      case 'low':
        return 'rgba(74, 222, 128, 0.1)'; // light green
      case 'medium':
        return 'rgba(251, 191, 36, 0.1)'; // light amber
      case 'high':
        return 'rgba(239, 68, 68, 0.1)'; // light red
      default:
        return 'transparent';
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

  useEffect(() => {
    // Set focus when modal opens
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        const input = document.getElementById('title');
        if (input) input.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden animate-in fade-in border-l-4 ${getPriorityBorderColor()}`}
        style={{ backgroundColor: getPriorityBackgroundColor() }}
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
              <div className="flex flex-wrap gap-1 mb-1">
                <ButtonCustom
                  type="button"
                  size="sm"
                  variant={textSelection.text ? "outline" : "ghost"}
                  className="h-8 px-2 text-xs"
                  onClick={() => applyFormatting('bold')}
                  disabled={!textSelection.text}
                >
                  <Bold className="h-3.5 w-3.5" />
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="sm"
                  variant={textSelection.text ? "outline" : "ghost"}
                  className="h-8 px-2 text-xs"
                  onClick={() => applyFormatting('italic')}
                  disabled={!textSelection.text}
                >
                  <Italic className="h-3.5 w-3.5" />
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="sm"
                  variant={textSelection.text ? "outline" : "ghost"}
                  className="h-8 px-2 text-xs"
                  onClick={() => applyFormatting('underline')}
                  disabled={!textSelection.text}
                >
                  <Underline className="h-3.5 w-3.5" />
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="sm"
                  variant={textSelection.text ? "outline" : "ghost"}
                  className="h-8 px-2 text-xs"
                  onClick={() => applyFormatting('link')}
                  disabled={!textSelection.text}
                >
                  <Link className="h-3.5 w-3.5" />
                </ButtonCustom>
                <ButtonCustom
                  type="button"
                  size="sm"
                  variant={textSelection.text ? "outline" : "ghost"}
                  className="h-8 px-2 text-xs"
                  onClick={() => applyFormatting('list')}
                  disabled={!textSelection.text}
                >
                  <List className="h-3.5 w-3.5" />
                </ButtonCustom>
              </div>
              <Textarea
                id="description"
                name="description"
                placeholder="Add details about this task..."
                value={taskData.description}
                onChange={handleChange}
                onSelect={handleTextSelection}
                ref={textareaRef}
                rows={3}
              />
              {textSelection.text && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: "{textSelection.text.substring(0, 30)}{textSelection.text.length > 30 ? '...' : ''}"
                </p>
              )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
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
                <Label htmlFor="endTime">End Time</Label>
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

            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring</Label>
              <Select
                value={taskData.recurring}
                onValueChange={(value) => setTaskData(prev => ({ ...prev, recurring: value }))}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="No repetition" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No repetition</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
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
