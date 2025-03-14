
import { User, UserCog, LogOut, Upload, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ButtonCustom } from '@/components/ui/button-custom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  const { logout, user, updateUser } = useAuth();
  const [isHovering, setIsHovering] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    
    try {
      toast.loading('Uploading profile picture...');
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update user profile
      await updateUser({ photoURL: data.publicUrl });
      
      toast.dismiss();
      toast.success('Profile picture updated');
      
    } catch (error) {
      toast.dismiss();
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    }
  };
  
  const handleRemoveProfilePicture = async () => {
    if (!user) return;
    
    try {
      toast.loading('Removing profile picture...');
      
      // Update user profile to remove photo URL
      await updateUser({ photoURL: null });
      
      toast.dismiss();
      toast.success('Profile picture removed');
      
    } catch (error) {
      toast.dismiss();
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const renderUserIcon = () => {
    if (user?.photoURL) {
      return (
        <div className="relative w-full h-full rounded-full overflow-hidden" 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img 
            src={user.photoURL} 
            alt={user.name || 'User'} 
            className="w-full h-full rounded-full object-cover"
          />
          {isHovering && (
            <div className="absolute inset-0 bg-black/60 flex justify-center items-center space-x-2">
              <label htmlFor="profile-upload" className="cursor-pointer p-1 rounded-full bg-primary/80 hover:bg-primary">
                <Upload className="h-3 w-3 text-white" />
                <input 
                  id="profile-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
              <button 
                className="p-1 rounded-full bg-destructive/80 hover:bg-destructive"
                onClick={handleRemoveProfilePicture}
              >
                <Trash className="h-3 w-3 text-white" />
              </button>
            </div>
          )}
        </div>
      );
    }
    
    // Display initials when no photo
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center bg-primary/10 text-primary-foreground relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <span className="font-semibold">{getInitials(user?.name || 'User')}</span>
        
        {isHovering && (
          <div className="absolute inset-0 bg-black/60 flex justify-center items-center">
            <label htmlFor="profile-upload" className="cursor-pointer p-1 rounded-full bg-primary/80 hover:bg-primary">
              <Upload className="h-3 w-3 text-white" />
              <input 
                id="profile-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}
      </div>
    );
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
        <div className="w-10 h-10 flex items-center justify-center">
          {renderUserIcon()}
        </div>
      )}
    </button>
  );

  return (
    <div className="h-10">
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
    </div>
  );
};

export default UserMenu;
