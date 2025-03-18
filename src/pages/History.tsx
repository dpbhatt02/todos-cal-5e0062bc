
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ButtonCustom } from '@/components/ui/button-custom';
import { format, parseISO, subDays } from 'date-fns';
import { Clock, Activity, ArrowRight, Check, Trash, Edit, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskHistory {
  id: string;
  task_id: string;
  task_title: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'synced';
  timestamp: string;
  details?: string;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Get date 30 days ago
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
        
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <ArrowRight className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <Trash className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'synced':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, 'MMM dd, yyyy h:mm a');
    } catch (err) {
      return isoString;
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
        <h1 className="text-2xl font-bold">Task History</h1>
        <p className="text-sm text-muted-foreground">Last 30 days of activity</p>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No activity recorded in the last 30 days.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mr-4 mt-1 bg-muted rounded-full p-2">
                {getActionIcon(item.action)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{item.task_title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(item.timestamp)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Task was {item.action}{item.details ? `: ${item.details}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
