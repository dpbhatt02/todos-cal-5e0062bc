
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subDays, format, parseISO } from 'date-fns';
import { ButtonCustom } from '@/components/ui/button-custom';
import { TaskHistory } from '@/components/tasks/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, ExternalLink } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Calculate date 30 days ago
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        // Get task history from task_history table
        const { data, error } = await supabase
          .from('task_history')
          .select(`
            id,
            task_id,
            task_title,
            action,
            timestamp,
            details,
            user_id
          `)
          .eq('user_id', user.id)
          .gte('timestamp', thirtyDaysAgo)
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error fetching task history:', error);
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

        setHistory(mappedData);
      } catch (err) {
        console.error('Failed to fetch task history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

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

  if (!user) {
    return (
      <div className="container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your task history.</p>
          <ButtonCustom
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/auth')}
          >
            Go to Login
          </ButtonCustom>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task History</h1>
          <p className="text-muted-foreground">Recent activity from the past 30 days</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Clock className="h-6 w-6 animate-spin text-primary" />
            <p>Loading history...</p>
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">No History Found</h3>
          <p className="text-muted-foreground">
            There is no task activity recorded in the past 30 days.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>Task activity from the past 30 days</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatDateTime(item.timestamp)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="truncate max-w-64">{item.taskTitle}</span>
                    <ButtonCustom
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => navigate(`/tasks?id=${item.taskId}`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="sr-only">View Task</span>
                    </ButtonCustom>
                  </div>
                </TableCell>
                <TableCell>{getActionLabel(item.action)}</TableCell>
                <TableCell>{item.details || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default History;
