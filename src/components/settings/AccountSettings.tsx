
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Mail, Key, Upload, Trash, AlertTriangle, Save } from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AccountSettings = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    avatar: user?.photoURL || "/placeholder.svg"
  });
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUser({ name: formData.name });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
      
      // Update local form data
      setFormData(prev => ({ ...prev, avatar: data.publicUrl }));
      
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
      
      // Update local form data
      setFormData(prev => ({ ...prev, avatar: "/placeholder.svg" }));
      
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

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would trigger account deletion with confirmation
    console.log("Delete account");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>
            Update your profile details and how others see you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center gap-2">
              <div 
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {formData.avatar && formData.avatar !== "/placeholder.svg" ? (
                  <>
                    <img 
                      src={formData.avatar} 
                      alt={formData.name} 
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
                  </>
                ) : (
                  <>
                    <Avatar className="h-full w-full">
                      <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                    </Avatar>
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
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Click to change avatar</p>
            </div>
            
            <div className="space-y-4 flex-1 w-full">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email} 
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className={`${isMobile ? 'flex-col space-y-2 items-stretch' : 'justify-end'}`}>
          <Button onClick={handleSave} className="gap-2 w-full md:w-auto">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>
            Manage your password and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center justify-between'}`}>
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Last changed 3 months ago
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleChangePassword}
              className={isMobile ? 'w-full mt-2' : ''}
            >
              Change Password
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h4 className="font-medium">Two-factor Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
            <Button 
              variant="outline"
              className={isMobile ? 'w-full' : ''}
            >
              Set up 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Permanent actions that cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Delete Account</AlertTitle>
            <AlertDescription className="pt-2">
              <p className="mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className={isMobile ? 'w-full' : ''}
              >
                Delete Account
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};
