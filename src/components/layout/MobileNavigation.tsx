
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ListTodo, Search, Menu, Tag, Settings, HelpCircle, LogOut, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import SearchTasksSheet from '@/components/tasks/SearchTasksSheet';

interface MobileNavigationProps {
  toggleCreateModal: () => void;
}

const MobileNavigation = ({ toggleCreateModal }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const navigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks' },
    { icon: Search, label: 'Search', action: () => setIsSearchOpen(true) },
    { icon: Menu, label: 'Menu', path: '/menu' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const tags = [
    { id: 'work', label: 'Work', color: 'bg-blue-500' },
    { id: 'personal', label: 'Personal', color: 'bg-purple-500' },
    { id: 'health', label: 'Health', color: 'bg-green-500' },
    { id: 'learning', label: 'Learning', color: 'bg-amber-500' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 md:hidden">
      <div className="grid grid-cols-5 h-full">
        {/* Home Button (First Item) */}
        <Button
          variant="ghost"
          className={cn(
            "h-full rounded-none flex flex-col items-center justify-center",
            isActive('/') ? "bg-muted text-primary" : "text-muted-foreground"
          )}
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
        
        {/* Tasks Button (Second Item) */}
        <Button
          variant="ghost"
          className={cn(
            "h-full rounded-none flex flex-col items-center justify-center",
            isActive('/tasks') ? "bg-muted text-primary" : "text-muted-foreground"
          )}
          onClick={() => navigate('/tasks')}
        >
          <ListTodo className="h-5 w-5 mb-1" />
          <span className="text-xs">Tasks</span>
        </Button>
        
        {/* Center Button for New Task */}
        <div className="flex items-center justify-center">
          <button
            className="bg-primary rounded-full h-12 w-12 flex items-center justify-center -mt-6 shadow-lg"
            onClick={toggleCreateModal}
          >
            <Plus className="h-6 w-6 text-primary-foreground" />
          </button>
        </div>
        
        {/* Search Button (Fourth Item) */}
        <Button
          variant="ghost"
          className="h-full rounded-none flex flex-col items-center justify-center text-muted-foreground"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-5 w-5 mb-1" />
          <span className="text-xs">Search</span>
        </Button>
        
        {/* Menu Button (Fifth Item) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="h-full rounded-none flex flex-col items-center justify-center text-muted-foreground"
            >
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20">
              {/* User profile section */}
              {user && (
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xl font-medium">{user.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.name || 'User'}</div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tags section */}
              <div className="p-4 border-b">
                <h3 className="flex items-center mb-3 font-medium">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h3>
                <div className="space-y-1 ml-1">
                  {tags.map((tag) => (
                    <div 
                      key={tag.id}
                      className="flex items-center px-2 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/tag/${tag.id}`)}
                    >
                      <div className={cn("h-3 w-3 rounded-full mr-2", tag.color)} />
                      <span className="text-sm">{tag.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Settings and Help section */}
              <div className="p-4 space-y-1">
                <button 
                  className="flex w-full items-center px-2 py-2 rounded-md text-left cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="text-sm">Settings</span>
                </button>
                <button 
                  className="flex w-full items-center px-2 py-2 rounded-md text-left cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate('/help')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Help & Support</span>
                </button>
                <button 
                  className="flex w-full items-center px-2 py-2 rounded-md text-left cursor-pointer hover:bg-muted/50 transition-colors text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Search Modal */}
      <SearchTasksSheet 
        isOpen={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </div>
  );
};

export default MobileNavigation;
