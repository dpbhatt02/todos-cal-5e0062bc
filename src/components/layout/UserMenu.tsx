
import { User, UserCog, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ButtonCustom } from '@/components/ui/button-custom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItemType {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface UserMenuProps {
  isSidebarOpen: boolean;
  menuItems?: MenuItemType[];
}

const UserMenu = ({ isSidebarOpen, menuItems = [] }: UserMenuProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleEditProfile = () => {
    navigate('/settings');
    window.localStorage.setItem('settings-active-tab', 'account');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderUserIcon = () => {
    if (user?.photoURL) {
      return (
        <img 
          src={user.photoURL} 
          alt={user.name || 'User'} 
          className="w-full h-full rounded-full object-cover"
        />
      );
    }
    return <User className="h-5 w-5" />;
  };

  const userButton = (
    <button className={`${isSidebarOpen ? 'w-full' : 'w-10 h-10'} rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors duration-200 overflow-hidden ${isSidebarOpen ? 'p-2' : ''}`}>
      {isSidebarOpen ? (
        <div className="flex items-center space-x-2 w-full">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
            {renderUserIcon()}
          </div>
          <span className="text-sm font-medium truncate flex-1">
            {user?.name || 'User'}
          </span>
        </div>
      ) : (
        renderUserIcon()
      )}
    </button>
  );

  return (
    <DropdownMenu>
      {isSidebarOpen ? (
        <DropdownMenuTrigger asChild>
          {userButton}
        </DropdownMenuTrigger>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                {userButton}
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              User Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <DropdownMenuContent align="end" className="w-56 z-50 bg-popover">
        {user && (
          <>
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium">{user.name || 'User'}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
          <UserCog className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        
        {/* Additional menu items from props */}
        {menuItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {menuItems.map((item) => (
              <DropdownMenuItem 
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
