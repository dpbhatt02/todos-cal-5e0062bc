
import { Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RecurringTaskOptions, { WeekdayOption } from './RecurringTaskOptions';

export const WEEKDAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

interface TaskRecurringControlsProps {
  recurring: string;
  selectedWeekdays: string[];
  recurrenceEndType: string;
  recurrenceEndDate: string;
  recurrenceCount: number;
  dueDate: string;
  onRecurringChange: (value: string) => void;
  onWeekdayToggle: (weekdayId: string) => void;
  onRecurrenceEndTypeChange: (type: string) => void;
  onRecurrenceEndDateChange: (date: string) => void;
  onRecurrenceCountChange: (count: number) => void;
}

const TaskRecurringControls = ({
  recurring,
  selectedWeekdays,
  recurrenceEndType,
  recurrenceEndDate,
  recurrenceCount,
  dueDate,
  onRecurringChange,
  onWeekdayToggle,
  onRecurrenceEndTypeChange,
  onRecurrenceEndDateChange,
  onRecurrenceCountChange
}: TaskRecurringControlsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="recurring">Recurring</Label>
      <Select
        value={recurring}
        onValueChange={onRecurringChange}
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
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      
      {recurring !== 'none' && (
        <div className="space-y-3 p-3 border rounded-md bg-muted/20">
          {recurring === 'custom' && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => (
                  <WeekdayOption
                    key={day.id}
                    id={day.id}
                    label={day.label}
                    checked={selectedWeekdays.includes(day.id)}
                    onToggle={onWeekdayToggle}
                  />
                ))}
              </div>
            </div>
          )}
          
          <RecurringTaskOptions
            recurrenceEndType={recurrenceEndType}
            recurrenceEndDate={recurrenceEndDate}
            recurrenceCount={recurrenceCount}
            dueDate={dueDate}
            onRecurrenceTypeChange={onRecurrenceEndTypeChange}
            onRecurrenceEndDateChange={onRecurrenceEndDateChange}
            onRecurrenceCountChange={onRecurrenceCountChange}
          />
        </div>
      )}
    </div>
  );
};

export default TaskRecurringControls;
