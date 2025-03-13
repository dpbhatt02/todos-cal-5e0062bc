
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  return (
    <>
      <nav className="space-y-1 mt-2">
        {mainNavItems.map((item) => (
          isSidebarOpen ? (
            <ButtonCustom
              key={item.path}
              variant={location.pathname === item.path ? "primary" : "ghost"}
              className={cn(
                "w-full justify-start text-left mb-1",
                location.pathname === item.path 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground"
              )}
              onClick={() => navigate(item.path)}
              icon={<item.icon className="h-5 w-5" />}
            >
              <span>{item.label}</span>
            </ButtonCustom>
          ) : (
            <TooltipProvider key={item.path}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ButtonCustom
                    variant={location.pathname === item.path ? "primary" : "ghost"}
                    className={cn(
                      "w-full justify-center p-2 mb-1",
                      location.pathname === item.path 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground"
                    )}
                    onClick={() => navigate(item.path)}
                    icon={<item.icon className="h-5 w-5" />}
                  />
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        ))}
      </nav>
    </>
  );
};

export default NavigationLinks;
