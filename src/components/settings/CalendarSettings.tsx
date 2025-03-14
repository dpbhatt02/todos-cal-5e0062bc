
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CalendarSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user has connected Google Calendar
  useEffect(() => {
    const checkGoogleConnection = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Get saved connection status from database
        const { data, error } = await supabase
          .from('user_integrations')
          .select('connected, provider_email')
          .eq('user_id', user.id)
          .eq('provider', 'google_calendar')
          .maybeSingle();

        if (error) {
          console.error('Error checking Google Calendar connection:', error);
          return;
        }

        if (data) {
          setIsConnected(data.connected);
          setGoogleEmail(data.provider_email);
        }
      } catch (error) {
        console.error('Error checking Google Calendar connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkGoogleConnection();
  }, [user]);

  const handleConnect = async () => {
    if (!user) {
      toast.error('You must be logged in to connect your Google Calendar');
      return;
    }

    setIsLoading(true);
    try {
      // Start Google OAuth flow
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { 
          userId: user.id,
          redirectUrl: window.location.origin
        }
      });

      if (error) {
        console.error('Error starting Google auth flow:', error);
        toast.error('Failed to connect to Google Calendar');
        return;
      }

      if (data && data.authUrl) {
        // Save to localStorage that we're heading to settings and want the "calendar" tab
        window.localStorage.setItem('settings-active-tab', 'calendars');
        // Redirect to Google OAuth consent screen
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Failed to connect to Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Revoke Google Calendar access
      const { error } = await supabase.functions.invoke('google-calendar-disconnect', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error disconnecting from Google Calendar:', error);
        toast.error('Failed to disconnect from Google Calendar');
        return;
      }

      // Update local state
      setIsConnected(false);
      setGoogleEmail(null);
      toast.success('Disconnected from Google Calendar');
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast.error('Failed to disconnect from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Calendars</CardTitle>
          <CardDescription>
            Connect and sync your calendars to manage all your events in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CalendarIcon className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="font-medium text-lg">Connect to Google Calendar</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Link your Google Calendar to sync events with your tasks and see everything in one place.
                </p>
              </div>
              <Button 
                onClick={handleConnect} 
                className="mt-4 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <svg 
                    viewBox="0 0 24 24" 
                    width="16" 
                    height="16" 
                    className="fill-current"
                  >
                    <path 
                      d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z"
                    />
                  </svg>
                )}
                Connect Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-1 rounded">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{googleEmail || "Connected Account"}</div>
                    <div className="flex items-center text-sm text-green-600">
                      Connected
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    disabled={isLoading}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your Google Calendar is connected. Calendar integration features coming soon!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSettings;
