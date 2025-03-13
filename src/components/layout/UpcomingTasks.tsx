
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ButtonCustom } from '@/components/ui/button-custom';

interface UpcomingTasksProps {
  isSidebarOpen: boolean;
}

const UpcomingTasks = ({ isSidebarOpen }: UpcomingTasksProps) => {
  const navigate = useNavigate();

  if (!isSidebarOpen) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center mb-2">
        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
      </div>
      <div className="rounded-md bg-muted/40 p-3 mb-4">
        <p className="text-xs text-muted-foreground">
          You have 3 tasks due today
        </p>
        <ButtonCustom
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left mt-2 bg-background/50"
          onClick={() => navigate('/tasks/today')}
        >
          <span>View today's tasks</span>
        </ButtonCustom>
      </div>
    </div>
  );
};

export default UpcomingTasks;
