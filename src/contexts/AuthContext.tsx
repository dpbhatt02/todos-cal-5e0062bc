
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
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signupWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Helper to convert Supabase user to our User type
const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name,
    photoURL: supabaseUser.user_metadata?.avatar_url,
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
          setUser(formatUser(session.user));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthState();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(formatUser(session?.user || null));
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
      
      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
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
          redirectTo: `${window.location.origin}/tasks`
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
