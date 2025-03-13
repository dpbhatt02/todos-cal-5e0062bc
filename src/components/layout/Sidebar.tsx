
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarIcon, 
  ListTodo,
  Settings,
  Clock,
  HelpCircle,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar = ({ isSidebarOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ListTodo, label: 'Task List', path: '/tasks' },
    { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
    { icon: CheckSquare, label: 'Kanban Board', path: '/kanban' },
  ];

  const tags = [
    { id: 'work', label: 'Work', color: 'bg-blue-500' },
    { id: 'personal', label: 'Personal', color: 'bg-purple-500' },
    { id: 'health', label: 'Health', color: 'bg-green-500' },
    { id: 'learning', label: 'Learning', color: 'bg-amber-500' },
  ];

  return (
    <aside 
      className={cn(
        "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 border-r border-border/40 bg-sidebar shadow-sm transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64"
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 subtle-scroll">
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
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
            ))}
          </nav>

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

          <Separator className="my-4" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
              </div>
              <ButtonCustom
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label="Add tag"
                icon={<span className="text-xs">+</span>}
              />
            </div>
            
            <div className="space-y-1">
              {tags.map((tag) => (
                <div 
                  key={tag.id}
                  className={cn(
                    "flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                    activeTag === tag.id && "bg-muted/70"
                  )}
                  onClick={() => setActiveTag(tag.id === activeTag ? null : tag.id)}
                >
                  <div className={cn("h-2.5 w-2.5 rounded-full mr-2", tag.color)} />
                  <span className="text-sm">{tag.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 p-4">
          <div className="space-y-1">
            <ButtonCustom
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => navigate('/settings')}
              icon={<Settings className="h-5 w-5" />}
            >
              <span>Settings</span>
            </ButtonCustom>
            <ButtonCustom
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => navigate('/help')}
              icon={<HelpCircle className="h-5 w-5" />}
            >
              <span>Help & Support</span>
            </ButtonCustom>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
