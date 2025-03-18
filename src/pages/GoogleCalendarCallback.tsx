
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { invokeSyncFunction } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonCustom } from '@/components/ui/button-custom';
import { Check, AlertTriangle, Loader } from 'lucide-react';

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract the authorization code from the URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const state = queryParams.get('state'); // state should contain the user ID
        
        if (!code) {
          throw new Error('Authorization code is missing.');
        }
        
        // If user ID is not in the state (for security), use the current logged in user
        const userId = state || (user ? user.id : null);
        
        if (!userId) {
          throw new Error('User ID not found. Please ensure you are logged in.');
        }
        
        // Handle the callback - exchange the code for tokens and store in Supabase
        const { error } = await invokeSyncFunction('google-calendar-callback-handler', {
          code,
          state: userId,
          callbackUrl: window.location.origin + '/api/google-calendar-callback'
        });
        
        if (error) {
          throw new Error(error.toString());
        }
        
        setStatus('success');
      } catch (error) {
        console.error('Error handling Google Calendar callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };
    
    if (location.search) {
      handleCallback();
    } else {
      setStatus('error');
      setErrorMessage('No authorization code received from Google');
    }
  }, [location, user]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {status === 'loading' ? 'Connecting Calendar...' : 
             status === 'success' ? 'Calendar Connected!' : 
             'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Please wait while we connect your Google Calendar' : 
             status === 'success' ? 'Your Google Calendar has been successfully connected' : 
             'We encountered an issue connecting your Google Calendar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          {status === 'loading' ? (
            <Loader className="h-16 w-16 text-primary animate-spin" />
          ) : status === 'success' ? (
            <div className="bg-green-100 p-4 rounded-full">
              <Check className="h-12 w-12 text-green-600" />
            </div>
          ) : (
            <div className="bg-red-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          )}
        </CardContent>
        {status === 'error' && errorMessage && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          </CardContent>
        )}
        <CardFooter className="flex justify-center">
          <ButtonCustom
            variant="primary"
            onClick={() => navigate('/settings')}
            disabled={status === 'loading'}
          >
            {status === 'success' ? 'Go to Settings' : 'Try Again'}
          </ButtonCustom>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GoogleCalendarCallback;
