import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';

interface NavigationLinksProps {
  isSidebarOpen: boolean;
}

const NavigationLinks = ({ isSidebarOpen }: NavigationLinksProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ListTodo, label: 'Task List', path: '/tasks' },
  ];

  const footerNavItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  return (
    <>
      <nav className="space-y-1 mt-2">
        {mainNavItems.map((item) => (
          <ButtonCustom
            key={item.path}
            variant={location.pathname === item.path ? "primary" : "ghost"}
            className={cn(
              "w-full justify-start text-left mb-1",
              location.pathname === item.path 
                ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                : "text-sidebar-foreground",
              !isSidebarOpen && "justify-center p-2"
            )}
            onClick={() => navigate(item.path)}
            icon={<item.icon className="h-5 w-5" />}
          >
            {isSidebarOpen && <span>{item.label}</span>}
          </ButtonCustom>
        ))}
      </nav>

      {/* Footer nav is now rendered in Sidebar component */}
    </>
  );
};

export default NavigationLinks;
