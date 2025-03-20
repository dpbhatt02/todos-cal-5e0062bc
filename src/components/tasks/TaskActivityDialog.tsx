
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Activity, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TaskHistory } from './types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskActivityDialogProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TaskActivityDialog = ({ taskId, isOpen, onClose }: TaskActivityDialogProps) => {
  const [activities, setActivities] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskActivities();
    }
  }, [isOpen, taskId]);

  const fetchTaskActivities = async () => {
    if (!taskId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('task_history')
        .select('*')
        .eq('task_id', taskId)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching task activities:', error);
        return;
      }
      
      // Map the data to our TaskHistory type
      const mappedData: TaskHistory[] = (data || []).map(item => ({
        id: item.id,
        taskId: item.task_id,
        taskTitle: item.task_title,
        action: item.action as 'created' | 'updated' | 'completed' | 'deleted' | 'synced',
        timestamp: parseISO(item.timestamp),
        details: item.details,
        userId: item.user_id
      }));
      
      setActivities(mappedData);
    } catch (err) {
      console.error('Failed to fetch task activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Created';
      case 'updated':
        return 'Updated';
      case 'completed':
        return 'Completed';
      case 'deleted':
        return 'Deleted';
      case 'synced':
        return 'Synced to Calendar';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <Activity className="h-4 w-4 text-purple-500" />;
      case 'deleted':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'synced':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Activity History</DialogTitle>
          <DialogDescription>
            View all activity for this task
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-6 w-6 animate-spin text-primary" />
                <p>Loading activity...</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No activity records found for this task.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b">
                  <div className="mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <p className="font-medium">{getActionLabel(activity.action)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskActivityDialog;
