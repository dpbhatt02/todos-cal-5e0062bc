
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RecurringTaskOptionsProps {
  recurrenceEndType: string;
  recurrenceEndDate: string;
  recurrenceCount: number;
  dueDate: string;
  onRecurrenceTypeChange: (type: string) => void;
  onRecurrenceEndDateChange: (date: string) => void;
  onRecurrenceCountChange: (count: number) => void;
}

interface WeekdayOptionProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (id: string) => void;
}

export const WeekdayOption = ({ id, label, checked, onToggle }: WeekdayOptionProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={`day-${id}`}
        checked={checked}
        onCheckedChange={() => onToggle(id)}
      />
      <label 
        htmlFor={`day-${id}`}
        className="text-sm cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
};

const RecurringTaskOptions = ({
  recurrenceEndType,
  recurrenceEndDate,
  recurrenceCount,
  dueDate,
  onRecurrenceTypeChange,
  onRecurrenceEndDateChange,
  onRecurrenceCountChange
}: RecurringTaskOptionsProps) => {
  return (
    <div className="space-y-2">
      <Label>Ends</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="never-end"
            checked={recurrenceEndType === 'never'}
            onCheckedChange={() => onRecurrenceTypeChange('never')}
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
            checked={recurrenceEndType === 'date'}
            onCheckedChange={() => onRecurrenceTypeChange('date')}
          />
          <label 
            htmlFor="end-on-date"
            className="text-sm cursor-pointer flex items-center gap-2"
          >
            <span>On date</span>
            {recurrenceEndType === 'date' && (
              <Input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => onRecurrenceEndDateChange(e.target.value)}
                className="h-8 w-40"
                min={dueDate}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="end-after"
            checked={recurrenceEndType === 'after'}
            onCheckedChange={() => onRecurrenceTypeChange('after')}
          />
          <label 
            htmlFor="end-after"
            className="text-sm cursor-pointer flex items-center gap-2"
          >
            <span>After</span>
            {recurrenceEndType === 'after' && (
              <div className="flex items-center">
                <Input
                  type="number"
                  min="1"
                  max="999"
                  value={recurrenceCount}
                  onChange={(e) => onRecurrenceCountChange(parseInt(e.target.value) || 1)}
                  className="h-8 w-16"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <span className="ml-2">occurrences</span>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

export default RecurringTaskOptions;
