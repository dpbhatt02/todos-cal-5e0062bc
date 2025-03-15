
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for calendar data and user integrations
interface CalendarItem {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

interface UserIntegration {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id?: string;
  provider_email?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  connected: boolean;
  created_at: string;
  updated_at: string;
}

export const CalendarSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user has connected Google Calendar
  useEffect(() => {
    const checkGoogleConnection = async () => {
      if (!user) return;

      try {
        // Get saved connection status from database using a type assertion
        const { data, error } = await supabase
          .from('user_integrations')
          .select('connected, provider_email')
          .eq('user_id', user.id)
          .eq('provider', 'google_calendar')
          .maybeSingle() as unknown as { 
            data: Pick<UserIntegration, 'connected' | 'provider_email'> | null, 
            error: any 
          };

        if (error) {
          console.error('Error checking Google Calendar connection:', error);
          return;
        }

        if (data) {
          setIsConnected(data.connected);
          setGoogleEmail(data.provider_email);
          if (data.connected) {
            fetchCalendars();
          }
        }
      } catch (error) {
        console.error('Error checking Google Calendar connection:', error);
      }
    };

    checkGoogleConnection();
  }, [user]);

  const fetchCalendars = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch calendars from database or API
      const { data, error } = await supabase.functions.invoke('fetch-google-calendars', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error fetching calendars:', error);
        toast.error('Failed to fetch calendars');
        return;
      }

      if (data && data.calendars) {
        setCalendars(data.calendars.map((cal: any) => ({
          id: cal.id,
          name: cal.summary,
          color: cal.backgroundColor || getRandomColor(),
          enabled: true
        })));
      } else {
        // Fallback to sample data if no calendars found
        setCalendars([
          { id: "1", name: "Personal", color: "#4285F4", enabled: true },
          { id: "2", name: "Work", color: "#DB4437", enabled: true },
          { id: "3", name: "Family", color: "#0F9D58", enabled: false },
          { id: "4", name: "Holidays", color: "#F4B400", enabled: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
      toast.error('Failed to fetch calendars');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['#4285F4', '#DB4437', '#0F9D58', '#F4B400', '#795548', '#9E9E9E'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

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
          redirectUrl: window.location.origin + '/settings'
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
      setCalendars([]);
      toast.success('Disconnected from Google Calendar');
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast.error('Failed to disconnect from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSync = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      // Trigger calendar sync
      const { error } = await supabase.functions.invoke('sync-google-calendars', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error syncing calendars:', error);
        toast.error('Failed to sync calendars');
        return;
      }

      // Refetch calendars
      await fetchCalendars();
      toast.success('Calendars synced successfully');
    } catch (error) {
      console.error('Error syncing calendars:', error);
      toast.error('Failed to sync calendars');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSyncToggle = async (id: string) => {
    if (!user) return;
    
    // Update local state immediately for better UX
    setCalendars(calendars.map(cal => 
      cal.id === id ? { ...cal, enabled: !cal.enabled } : cal
    ));
    
    try {
      // Save calendar visibility setting
      const { error } = await supabase.functions.invoke('toggle-calendar-visibility', {
        body: { 
          userId: user.id,
          calendarId: id,
          enabled: !calendars.find(cal => cal.id === id)?.enabled
        }
      });

      if (error) {
        console.error('Error toggling calendar visibility:', error);
        toast.error('Failed to update calendar settings');
        // Revert local state on error
        setCalendars(calendars);
      }
    } catch (error) {
      console.error('Error toggling calendar visibility:', error);
      toast.error('Failed to update calendar settings');
      // Revert local state on error
      setCalendars(calendars);
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
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Live
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSync}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Resync
                  </Button>
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
              
              <p className="text-sm text-muted-foreground">Resync if calendars aren't up-to-date.</p>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Show events in TodosCal</h3>
                  <Switch 
                    checked={showEvents} 
                    onCheckedChange={setShowEvents}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Events are shown in Today and Upcoming. <a href="#" className="text-primary hover:underline">Learn more</a>.
                </p>
                
                <div className="space-y-2 mt-6">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : calendars.length > 0 ? (
                    calendars.map((calendar) => (
                      <div key={calendar.id} className="flex items-center justify-between py-2 border-t">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-sm" 
                            style={{ backgroundColor: calendar.color }}
                          />
                          <span>{calendar.name}</span>
                        </div>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSyncToggle(calendar.id)}
                        >
                          {calendar.enabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No calendars found. Try syncing again.
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="mt-6" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Sync Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="days-past">Days in the past</Label>
                    <Input id="days-past" type="number" defaultValue="7" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days-future">Days in the future</Label>
                    <Input id="days-future" type="number" defaultValue="30" />
                  </div>
                </div>
                <div className="pt-2">
                  <Button>Save Sync Settings</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSettings;
