
import React from 'react';
import { MenuIcon, BellIcon } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import SearchBar from './SearchBar';
import NotificationsPopover from '../notifications/NotificationsPopover';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleCreateModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleCreateModal }) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center mr-4">
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleSidebar}
            icon={<MenuIcon className="h-5 w-5" />}
          />
        </div>
        <div className={cn("hidden md:flex", isMobile ? "mx-2" : "mx-4")}>
          <SearchBar />
        </div>
        <div className="flex items-center ml-auto">
          <NotificationsPopover />
        </div>
      </div>
    </header>
  );
};

export default Header;
