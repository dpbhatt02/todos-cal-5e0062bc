import { useState, useRef } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import TaskFormattingToolbar from './TaskFormattingToolbar';

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

interface TaskFormBasicFieldsProps {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  startTime: string;
  endTime: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

const TaskFormBasicFields = ({
  title,
  description,
  dueDate,
  priority,
  startTime,
  endTime,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onPriorityChange,
  onStartTimeChange,
  onEndTimeChange
}: TaskFormBasicFieldsProps) => {
  
  const [textSelection, setTextSelection] = useState<TextSelection>({
    start: 0,
    end: 0,
    text: ''
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = description.substring(start, end);
      
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

    const before = description.substring(0, textSelection.start);
    const after = description.substring(textSelection.end);
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

    onDescriptionChange(before + formattedText + after);
    setTextSelection({ start: 0, end: 0, text: '' });
  };

  // Improved event handlers to effectively stop propagation
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleInputFocus = (e: React.FocusEvent) => {
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.stopPropagation();
    const { name, value } = e.target;
    
    switch (name) {
      case 'title':
        onTitleChange(value);
        break;
      case 'description':
        onDescriptionChange(value);
        break;
      case 'dueDate':
        onDueDateChange(value);
        break;
      case 'startTime':
        onStartTimeChange(value);
        break;
      case 'endTime':
        onEndTimeChange(value);
        break;
    }
  };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="What needs to be done??"
         // value={title}
          onChange={handleChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <TaskFormattingToolbar 
          textSelection={textSelection}
          applyFormatting={applyFormatting}
        />
        <Textarea
          id="description"
          name="description"
          placeholder="Add details about this task..."
          //value={description}
          onChange={handleChange}
          onSelect={handleTextSelection}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
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
              //value={dueDate}
              onChange={handleChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              className="pl-9"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Priority</Label>
          <ToggleGroup 
            type="single" 
            //value={priority}
            onValueChange={(value) => {
              if (value) onPriorityChange(value);
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="low" aria-label="Low priority" onClick={(e) => e.stopPropagation()}>
              <span className="h-2 w-2 rounded-full bg-priority-low mr-1.5"></span>
              Low
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" aria-label="Medium priority" onClick={(e) => e.stopPropagation()}>
              <span className="h-2 w-2 rounded-full bg-priority-medium mr-1.5"></span>
              Med
            </ToggleGroupItem>
            <ToggleGroupItem value="high" aria-label="High priority" onClick={(e) => e.stopPropagation()}>
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
              //value={startTime}
              onChange={handleChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
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
             // value={endTime}
              onChange={handleChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormBasicFields;
