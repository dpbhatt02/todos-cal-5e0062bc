
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ButtonCustom } from '@/components/ui/button-custom';
import SidebarHeader from './SidebarHeader';
import NavigationLinks from './NavigationLinks';
import TagsList from './TagsList';
import UserMenu from './UserMenu';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  toggleCreateModal: () => void;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar, openSidebar, toggleCreateModal }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // These items are now passed to UserMenu
  const footerNavItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 z-30 h-screen border-r border-border/40 bg-sidebar shadow-sm transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header with search, logo, and actions */}
        <SidebarHeader 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          openSidebar={openSidebar}
          toggleCreateModal={toggleCreateModal}
        />
        
        {/* Main content area */}
        <div className={cn(
          "flex-1 overflow-y-auto subtle-scroll flex flex-col",
          isSidebarOpen ? "p-4" : "p-2"
        )}>
          {/* Main navigation links */}
          <NavigationLinks isSidebarOpen={isSidebarOpen} />
          
          {/* Tags section */}
          <Separator className="my-4" />
          <TagsList isSidebarOpen={isSidebarOpen} />
          
          {/* Spacer to push user menu to bottom */}
          <div className="flex-1" />
          
          {/* User menu with settings and help now integrated */}
          <div className={cn(
            "pb-4",
            isSidebarOpen ? "px-2" : "flex justify-center"
          )}>
            <UserMenu 
              isSidebarOpen={isSidebarOpen}
              menuItems={footerNavItems}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
