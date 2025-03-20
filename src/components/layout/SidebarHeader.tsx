
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';
import SearchBar from './SearchBar';
import NotificationsPopover from '../notifications/NotificationsPopover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  toggleCreateModal: () => void;
}

const SidebarHeader = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  openSidebar,
  toggleCreateModal 
}: SidebarHeaderProps) => {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    openSidebar();
    // Focus the search input after a small delay to ensure it's rendered
    setTimeout(() => {
      const searchInput = document.querySelector('[placeholder="Search tasks..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  return (
    <div className="p-4 border-b border-border/40">
      <div className="flex items-center justify-between mb-4">
        <div 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            !isSidebarOpen && "justify-center"
          )}
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            TK
          </div>
          {isSidebarOpen && <span className="text-lg font-medium">Taskendar</span>}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ButtonCustom
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={toggleSidebar}
                icon={isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              />
            </TooltipTrigger>
            <TooltipContent side="right">
              {isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <SearchBar isSidebarOpen={isSidebarOpen} handleSearchClick={handleSearchClick} />
      
      <div className={cn(
        "flex items-center",
        isSidebarOpen ? "justify-between mt-4" : "justify-center flex-col gap-5 mt-6"
      )}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ButtonCustom
                variant="primary"
                size="sm"
                className={cn(
                  "rounded-full shadow-sm",
                  !isSidebarOpen && "w-10 h-10 p-0"
                )}
                icon={<Plus className="h-4 w-4" />}
                onClick={(e) => {
                  e.preventDefault();
                  console.log("New Task button clicked");
                  toggleCreateModal();
                }}
              >
                {isSidebarOpen && <span>New Task</span>}
              </ButtonCustom>
            </TooltipTrigger>
            <TooltipContent side="right" hidden={isSidebarOpen}>
              New Task
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {isSidebarOpen ? (
          <div className="flex items-center gap-2">
            <NotificationsPopover isSidebarOpen={isSidebarOpen} />
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NotificationsPopover isSidebarOpen={isSidebarOpen} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Notifications
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
