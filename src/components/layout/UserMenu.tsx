
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

interface UserMenuProps {
  isSidebarOpen: boolean;
}

const UserMenu = ({ isSidebarOpen }: UserMenuProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleEditProfile = () => {
    navigate('/settings');
    window.localStorage.setItem('settings-active-tab', 'account');
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
    return <User className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`${isSidebarOpen ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors duration-200 overflow-hidden`}>
          {renderUserIcon()}
        </button>
      </DropdownMenuTrigger>
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
