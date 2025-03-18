
import { useState, useRef, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Bold, Italic, Link, List, Underline, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
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
import { format } from 'date-fns';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  editMode?: boolean;
  initialData?: any;
}

const WEEKDAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

const defaultTaskData = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: formatDate(new Date()),
  startTime: '', // Changed from '09:00' to empty string
  endTime: '',   // Changed from '10:00' to empty string
  tags: [] as string[],
  recurring: 'none',
  recurrenceEndType: 'never', // 'never', 'date', 'after'
  recurrenceEndDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
  recurrenceCount: 5,
  selectedWeekdays: [] as string[],
  isAllDay: true  // Added to default to all-day tasks when no time is selected
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const CreateTaskModal = ({ isOpen, onClose, onSubmit, editMode = false, initialData = {} }: CreateTaskModalProps) => {
  const [taskData, setTaskData] = useState(() => ({
    ...defaultTaskData,
    ...(editMode ? initialData : {})
  }));

  useEffect(() => {
    if (editMode) {
      setTaskData((prev) => ({ ...prev, ...initialData }));
    }
  }, [editMode, initialData]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If user sets a time value, update isAllDay accordingly
    if ((name === 'startTime' || name === 'endTime') && value) {
      setTaskData(prev => ({ 
        ...prev, 
        [name]: value,
        isAllDay: false // If user sets a time, it's not an all-day task
      }));
    } else {
      setTaskData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of the data that will be submitted
    const submissionData = { ...taskData };
    
    // Only include time fields if they have values (not empty strings)
    if (!submissionData.startTime) {
      // If no start time, this is an all-day task
      submissionData.isAllDay = true;
      // Remove time fields if they're empty
      delete submissionData.startTime;
      delete submissionData.endTime;
    } else {
      // If start time is provided, ensure it's properly formatted
      submissionData.isAllDay = false;
      console.log('Submitting task data in a Not AllDay condition.');
      console.log('start time:'+ submissionData.startTime);
      console.log('start time:'+ submissionData.endTime);
      // Ensure startTime is a string in HH:MM format
      if (submissionData.startTime instanceof Date) {
        submissionData.startTime = format(submissionData.startTime, 'HH:mm');
      }
      
      // If end time is provided, ensure it's properly formatted
      if (submissionData.endTime) {
        if (submissionData.endTime instanceof Date) {
          submissionData.endTime = format(submissionData.endTime, 'HH:mm');
        }
      }
      // Note: If no end time is provided, backend will add +30 minutes to start time
    }
    
    console.log('Submitting task data:', submissionData);
    onSubmit(submissionData);
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

  // Add a toggle for all-day tasks
  const toggleAllDay = (checked: boolean) => {
    setTaskData(prev => ({
      ...prev,
      isAllDay: checked,
      // Clear time fields if switching to all-day
      startTime: checked ? '' : prev.startTime,
      endTime: checked ? '' : prev.endTime
    }));
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden animate-in fade-in border-l-4 ${getPriorityBorderColor()}`}
        style={{ backgroundColor: getPriorityBackgroundColor() }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{editMode ? 'Edit Task' : 'New Task'}</h2>
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

            {/* All-day toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAllDay"
                checked={taskData.isAllDay}
                onCheckedChange={toggleAllDay}
              />
              <label 
                htmlFor="isAllDay"
                className="text-sm cursor-pointer"
              >
                All-day task (no specific time)
              </label>
            </div>

            {/* Only show time fields if not all-day task */}
            {!taskData.isAllDay && (
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
                  <Label htmlFor="endTime">End Time (optional)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={taskData.endTime}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="+ 30min from start"
                    />
                  </div>
                  {taskData.startTime && !taskData.endTime && (
                    <p className="text-xs text-muted-foreground">
                      Will default to 30 minutes after start time
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring</Label>
              <Select
                value={taskData.recurring}
                onValueChange={(value) => {
                  setTaskData(prev => ({ 
                    ...prev, 
                    recurring: value,
                    // Reset selectedWeekdays if not custom
                    selectedWeekdays: value === 'custom' ? prev.selectedWeekdays : []
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="No repetition" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[105]">
                  <SelectItem value="none">No repetition</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {taskData.recurring !== 'none' && (
              <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                {taskData.recurring === 'custom' && (
                  <div className="space-y-2">
                    <Label>Repeat on</Label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map(day => (
                        <div key={day.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${day.id}`}
                            checked={taskData.selectedWeekdays.includes(day.id)}
                            onCheckedChange={() => handleWeekdayToggle(day.id)}
                          />
                          <label 
                            htmlFor={`day-${day.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Ends</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="never-end"
                        checked={taskData.recurrenceEndType === 'never'}
                        onCheckedChange={() => 
                          setTaskData(prev => ({ ...prev, recurrenceEndType: 'never' }))
                        }
                      />
                      <label 
                        htmlFor="never-end"
                        className="text-sm cursor-pointer"
                      >
                        Never
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="end-on-date"
                        checked={taskData.recurrenceEndType === 'date'}
                        onCheckedChange={() => 
                          setTaskData(prev => ({ ...prev, recurrenceEndType: 'date' }))
                        }
                      />
                      <label 
                        htmlFor="end-on-date"
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <span>On date</span>
                        {taskData.recurrenceEndType === 'date' && (
                          <Input
                            type="date"
                            value={taskData.recurrenceEndDate}
                            onChange={(e) => 
                              setTaskData(prev => ({ 
                                ...prev, 
                                recurrenceEndDate: e.target.value 
                              }))
                            }
                            className="h-8 w-40"
                            min={taskData.dueDate}
                          />
                        )}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="end-after"
                        checked={taskData.recurrenceEndType === 'after'}
                        onCheckedChange={() => 
                          setTaskData(prev => ({ ...prev, recurrenceEndType: 'after' }))
                        }
                      />
                      <label 
                        htmlFor="end-after"
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <span>After</span>
                        {taskData.recurrenceEndType === 'after' && (
                          <div className="flex items-center">
                            <Input
                              type="number"
                              min="1"
                              max="999"
                              value={taskData.recurrenceCount}
                              onChange={(e) => 
                                setTaskData(prev => ({ 
                                  ...prev, 
                                  recurrenceCount: parseInt(e.target.value) || 1
                                }))
                              }
                              className="h-8 w-16"
                            />
                            <span className="ml-2">occurrences</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* Tags section hidden as per user request */}
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
              {editMode ? 'Update Task' : 'Create Task'}
            </ButtonCustom>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
