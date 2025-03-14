
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasksContext } from '@/contexts/TasksContext';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { TaskProps } from './types';

interface InlineTaskFormProps {
  date: Date;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type FormValues = z.infer<typeof formSchema>;

const InlineTaskForm = ({ date }: InlineTaskFormProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { createTask } = useTasksContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      priority: 'medium',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    console.log("Form submitted with values:", values);
    
    const taskData: Omit<TaskProps, 'id'> = {
      title: values.title,
      description: '',
      priority: values.priority as 'low' | 'medium' | 'high',
      dueDate: date,
      completed: false,
      tags: []
    };

    await createTask(taskData);
    form.reset();
    setIsFormVisible(false);
  };

  if (!isFormVisible) {
    return (
      <ButtonCustom
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground group"
        onClick={() => setIsFormVisible(true)}
      >
        <Plus className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" />
        Add task
      </ButtonCustom>
    );
  }

  return (
    <div className="border border-border rounded-md p-3 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Task name"
                    {...field}
                    autoFocus
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <ButtonCustom 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsFormVisible(false)}
              >
                Cancel
              </ButtonCustom>
              <ButtonCustom 
                type="submit" 
                variant="primary" 
                size="sm"
              >
                Add
              </ButtonCustom>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InlineTaskForm;
