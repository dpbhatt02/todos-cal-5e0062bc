
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Define user type
export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  timezone?: string;
}

// Define user update type
interface UserUpdate {
  name?: string;
  photoURL?: string | null;
  timezone?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: UserUpdate) => Promise<void>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signupWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Get user's local timezone
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'UTC';
  }
};

// Helper to convert Supabase user to our User type
const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name,
    photoURL: supabaseUser.user_metadata?.avatar_url,
    timezone: supabaseUser.user_metadata?.timezone || getUserTimezone(),
  };
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set user if session exists
        if (session?.user) {
          const formattedUser = formatUser(session.user);
          
          // Check if timezone needs to be updated
          if (formattedUser && !formattedUser.timezone) {
            // Update the user's timezone in Supabase
            const timezone = getUserTimezone();
            await supabase.auth.updateUser({
              data: { timezone }
            });
            
            // Update the formatted user with the timezone
            formattedUser.timezone = timezone;
          }
          
          setUser(formattedUser);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthState();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const formattedUser = formatUser(session?.user || null);
      
      // Check if timezone needs to be updated on auth state change
      if (formattedUser && !formattedUser.timezone) {
        // Update the user's timezone in Supabase
        const timezone = getUserTimezone();
        await supabase.auth.updateUser({
          data: { timezone }
        });
        
        // Update the formatted user with the timezone
        formattedUser.timezone = timezone;
      }
      
      setUser(formattedUser);
      setLoading(false);
    });
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Successfully logged in');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email
  const signupWithEmail = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      const timezone = getUserTimezone();
      console.log('Detected timezone during signup:', timezone);
      
      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            timezone,
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Account created successfully. Please check your email for verification.');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/tasks`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Success message will be shown after redirect completion
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (userData: UserUpdate) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          name: userData.name !== undefined ? userData.name : user.name,
          avatar_url: userData.photoURL !== undefined ? userData.photoURL : user.photoURL,
          timezone: userData.timezone !== undefined ? userData.timezone : user.timezone,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          name: userData.name !== undefined ? userData.name : prev.name,
          photoURL: userData.photoURL !== undefined ? userData.photoURL : prev.photoURL,
          timezone: userData.timezone !== undefined ? userData.timezone : prev.timezone,
        };
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
