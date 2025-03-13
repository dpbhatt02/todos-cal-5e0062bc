
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Plus, Bell, User, X } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="w-full h-16 glass backdrop-blur-xl border-b border-border/40 z-20 sticky top-0 left-0 right-0">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ButtonCustom
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            icon={<Menu className="h-5 w-5" />}
          />
          
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              TC
            </div>
            <span className="text-lg font-medium hidden sm:inline-block">TodoCal</span>
          </div>
        </div>

        <div className={cn(
          "absolute left-0 top-0 w-full h-full bg-background md:bg-transparent md:static md:h-auto md:w-auto flex items-center transition-all duration-300 ease-in-out",
          isSearchOpen ? "opacity-100 z-10" : "opacity-0 -z-10 md:opacity-100 md:z-0"
        )}>
          <div className="w-full px-4 py-2 md:w-auto md:py-0 md:pr-0 flex items-center">
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full h-10 pl-9 pr-4 rounded-md bg-muted/50 border border-border/50 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-sm outline-none"
              />
            </div>
            <ButtonCustom
              variant="ghost"
              size="icon"
              className="ml-2 md:hidden"
              onClick={() => setIsSearchOpen(false)}
              icon={<X className="h-5 w-5" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ButtonCustom
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            icon={<Search className="h-5 w-5" />}
          />

          <ButtonCustom
            variant="primary"
            size="sm"
            className="rounded-full shadow-sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {/* Open new task modal */}}
          >
            <span className="hidden sm:inline-block">New Task</span>
          </ButtonCustom>

          <ButtonCustom
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
            icon={
              <>
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-priority-high rounded-full" />
              </>
            }
          />

          <button className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors duration-200">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
