
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ListTodo,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from 'react';

interface NavigationLinksProps {
  isSidebarOpen: boolean;
}

const NavigationLinks = ({ isSidebarOpen }: NavigationLinksProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mainNavItems = [
    // Dashboard hidden as per user request
    { icon: ListTodo, label: 'Task List', path: '/tasks' },
    { icon: History, label: 'History', path: '/history' },
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
            <div 
              key={item.path}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
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
              {hoveredItem === item.path && (
                <div 
                  className="fixed left-[4.5rem] z-[100] ml-1 whitespace-nowrap rounded-md bg-sidebar-primary px-3 py-1.5 text-xs font-medium text-sidebar-primary-foreground shadow-md animate-fade-in"
                  style={{ 
                    top: `${document.getElementById(item.path)?.getBoundingClientRect().top || 0}px`,
                  }}
                >
                  {item.label}
                </div>
              )}
              {hoveredItem !== item.path && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute inset-0 cursor-pointer" id={item.path} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )
        ))}
      </nav>
    </>
  );
};

export default NavigationLinks;
