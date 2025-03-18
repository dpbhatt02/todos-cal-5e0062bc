
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, subDays } from 'date-fns';
import { TaskHistory } from '@/types/TaskHistory';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTaskHistory = async () => {
      setLoading(true);
      try {
        // Get history from the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        
        const { data, error } = await supabase
          .from('task_history')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', thirtyDaysAgo)
          .order('timestamp', { ascending: false });
          
        if (error) {
          console.error('Error fetching task history:', error);
          return;
        }
        
        // Map the data to ensure it conforms to TaskHistory type
        const typedData = data.map(item => ({
          ...item,
          action: item.action as TaskHistory['action']
        }));
        
        setHistory(typedData);
      } catch (err) {
        console.error('Failed to fetch task history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskHistory();
  }, [user]);
  
  const getActionIcon = (action: TaskHistory['action']) => {
    switch (action) {
      case 'created':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'synced':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };
  
  const formatHistoryDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Task History</h1>
        <p>Please log in to view your task history.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Task History</h1>
      <p className="text-muted-foreground mb-6">
        View the last 30 days of activity for your tasks.
      </p>
      
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">No history found for the last 30 days.</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {history.map((item) => (
            <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getActionIcon(item.action)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.task_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.action.charAt(0).toUpperCase() + item.action.slice(1)} - {item.details}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatHistoryDate(item.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
