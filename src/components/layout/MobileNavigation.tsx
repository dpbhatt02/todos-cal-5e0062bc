
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ListTodo, Settings, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  toggleCreateModal: () => void;
}

const MobileNavigation = ({ toggleCreateModal }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 md:hidden">
      <div className="grid grid-cols-5 h-full">
        {navigationItems.map((item, index) => {
          // Show first two items on the left
          const isBefore = index < 2;
          // Show last two items on the right
          const isAfter = index >= 2;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="icon"
              className={cn(
                "h-full rounded-none",
                isBefore ? "col-start-" + (index + 1) : "",
                isAfter ? "col-start-" + (index + 2) : "",
                isActive(item.path) ? "bg-muted text-primary" : "text-muted-foreground"
              )}
              onClick={() => navigate(item.path)}
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Button>
          );
        })}
        
        {/* Center Button for New Task */}
        <button
          className="col-start-3 flex items-center justify-center"
          onClick={toggleCreateModal}
        >
          <div className="bg-primary rounded-full h-12 w-12 flex items-center justify-center -mt-6 shadow-lg">
            <Plus className="h-6 w-6 text-primary-foreground" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
