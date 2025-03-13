
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import SidebarHeader from './SidebarHeader';
import NavigationLinks from './NavigationLinks';
import TagsList from './TagsList';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  toggleCreateModal: () => void;
}

const Sidebar = ({ isSidebarOpen, toggleSidebar, openSidebar, toggleCreateModal }: SidebarProps) => {
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
          {isSidebarOpen && (
            <>
              <Separator className="my-4" />
              <TagsList isSidebarOpen={isSidebarOpen} />
            </>
          )}
          
          {/* Spacer to push footer nav to bottom */}
          <div className="flex-1" />
        </div>
        
        {/* Footer with settings and help links - Now moved to NavigationLinks */}
        {/* Additional footer content can be added here if needed */}
      </div>
    </aside>
  );
};

export default Sidebar;
