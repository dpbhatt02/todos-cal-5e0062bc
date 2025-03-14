
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type CalendarItem = {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor: string;
  accessRole: string;
  enabled?: boolean;
};

// Define the integration type to avoid TypeScript errors
type UserIntegration = {
  id: string;
  user_id: string;
  provider: string;
  provider_email: string | null;
  provider_user_id: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  connected: boolean;
};

const CalendarSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [syncingCalendars, setSyncingCalendars] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [calendarSettings, setCalendarSettings] = useState<Record<string, boolean>>({});
  const [loadingCalendars, setLoadingCalendars] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadIntegrationStatus();
    }
  }, [user]);

  const loadIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query the user_integrations table
      const { data, error: queryError } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('provider', 'google_calendar')
        .single();

      if (queryError) throw queryError;

      // Since we're using .single(), data will be a single object or null
      if (data) {
        // Use type assertion to tell TypeScript we know the structure
        const integration = data as unknown as UserIntegration;
        setConnected(integration.connected || false);
        setEmail(integration.provider_email || "");
        
        if (integration.connected) {
          fetchCalendars();
        }
      } else {
        setConnected(false);
        setEmail("");
      }
    } catch (err) {
      console.error("Error loading integration status:", err);
      // No integration found is expected for new users
      if (!(err as any).message?.includes("No rows found")) {
        setError("Failed to load integration status. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendars = async () => {
    if (!user) return;
    
    try {
      setLoadingCalendars(true);
      setError(null);
      
      const response = await fetch('/api/fetch-google-calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch calendars");
      }

      const { calendars: fetchedCalendars } = await response.json();
      
      // Fetch user's calendar settings
      const settingsResponse = await fetch('/api/calendar-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!settingsResponse.ok) {
        const errorData = await settingsResponse.json();
        throw new Error(errorData.error || "Failed to fetch calendar settings");
      }

      const { settings } = await settingsResponse.json();
      const settingsMap: Record<string, boolean> = {};
      
      // Create a settings map with calendar_id as key and enabled as value
      settings?.forEach((setting: any) => {
        settingsMap[setting.calendar_id] = setting.enabled;
      });
      
      // Merge calendars with settings
      const calendarsWithSettings = fetchedCalendars.map((cal: CalendarItem) => ({
        ...cal,
        enabled: settingsMap[cal.id] !== undefined ? settingsMap[cal.id] : true,
      }));
      
      setCalendars(calendarsWithSettings);
      setCalendarSettings(settingsMap);
    } catch (err) {
      console.error("Error fetching calendars:", err);
      setError("Failed to fetch calendars. Please try reconnecting.");
    } finally {
      setLoadingCalendars(false);
    }
  };

  const connectGoogleCalendar = async () => {
    if (!user) return;
    
    try {
      setConnecting(true);
      setError(null);

      // Get the current hostname and protocol for the redirect URL
      const redirectUrl = `${window.location.protocol}//${window.location.host}/api/google-calendar-callback`;
      
      const response = await fetch('/api/google-calendar-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, redirectUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate Google Calendar authentication");
      }

      const { authUrl } = await response.json();
      
      // Save the current tab in localStorage so we can return to it
      window.localStorage.setItem('settings-active-tab', 'calendars');
      
      // Redirect to Google's authorization page
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error connecting to Google Calendar:", err);
      setError("Failed to connect to Google Calendar. Please try again.");
      setConnecting(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!user) return;
    
    try {
      setDisconnecting(true);
      setError(null);
      
      const response = await fetch('/api/google-calendar-disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to disconnect Google Calendar");
      }

      toast({
        title: "Disconnected",
        description: "Google Calendar has been disconnected successfully.",
      });
      
      setConnected(false);
      setEmail("");
      setCalendars([]);
    } catch (err) {
      console.error("Error disconnecting Google Calendar:", err);
      setError("Failed to disconnect Google Calendar. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  };

  const syncCalendars = async () => {
    if (!user) return;
    
    try {
      setSyncingCalendars(true);
      setError(null);
      
      const response = await fetch('/api/sync-google-calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync calendars");
      }

      toast({
        title: "Calendars Synced",
        description: "Your Google Calendars have been synced successfully.",
      });
      
      // Refresh calendar list
      fetchCalendars();
    } catch (err) {
      console.error("Error syncing calendars:", err);
      setError("Failed to sync calendars. Please try again.");
    } finally {
      setSyncingCalendars(false);
    }
  };

  const toggleCalendarVisibility = async (calendarId: string, enabled: boolean) => {
    if (!user) return;
    
    try {
      // Optimistically update UI
      setCalendars(prev => 
        prev.map(cal => 
          cal.id === calendarId ? { ...cal, enabled } : cal
        )
      );
      
      const response = await fetch('/api/toggle-calendar-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          calendarId,
          enabled
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update calendar visibility");
      }
      
      // Update settings in state
      setCalendarSettings(prev => ({
        ...prev,
        [calendarId]: enabled
      }));
      
      toast({
        title: enabled ? "Calendar Enabled" : "Calendar Disabled",
        description: `Calendar "${calendars.find(c => c.id === calendarId)?.summary}" has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (err) {
      console.error("Error toggling calendar visibility:", err);
      
      // Revert UI changes on error
      setCalendars(prev => 
        prev.map(cal => 
          cal.id === calendarId ? { ...cal, enabled: !enabled } : cal
        )
      );
      
      toast({
        variant: "destructive",
        title: "Failed to update",
        description: "Could not update calendar visibility. Please try again.",
      });
    }
  };

  // Helper function to get color style from calendar backgroundColor
  const getCalendarColor = (color: string) => {
    if (!color) return "bg-gray-400";
    
    // Google Calendar colors are in #RRGGBB format
    return `bg-[${color}]`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Calendar Integration</h2>
        <p className="text-muted-foreground mb-4">
          Connect your Google Calendar to manage your events alongside your tasks.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Sync your Google Calendar events with Tasks & Calendar
          </CardDescription>
        </CardHeader>

        <CardContent>
          {connected ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div>
                  <p className="font-medium">Connected as</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <Badge variant="outline" className="ml-auto flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={syncCalendars}
                  disabled={syncingCalendars}
                >
                  {syncingCalendars && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sync Calendars
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={fetchCalendars}
                  disabled={loadingCalendars}
                >
                  {loadingCalendars && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Refresh Calendar List
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                Connect your Google Calendar to see and manage your events alongside your tasks.
              </p>
              <Button 
                onClick={connectGoogleCalendar}
                disabled={connecting}
              >
                {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Google Calendar
              </Button>
            </div>
          )}
        </CardContent>
        
        {connected && (
          <CardFooter className="border-t pt-4 flex justify-between">
            <p className="text-sm text-muted-foreground">
              You can disconnect at any time to remove access.
            </p>
            <Button 
              variant="outline" 
              onClick={disconnectGoogleCalendar}
              disabled={disconnecting}
            >
              {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </CardFooter>
        )}
      </Card>

      {connected && (
        <Card>
          <CardHeader>
            <CardTitle>Calendar Visibility</CardTitle>
            <CardDescription>
              Choose which calendars to display in your app.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loadingCalendars ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : calendars.length > 0 ? (
              <div className="space-y-4">
                {calendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: calendar.backgroundColor }}
                      />
                      <div>
                        <p className="font-medium">{calendar.summary}</p>
                        <p className="text-xs text-muted-foreground">
                          {calendar.primary ? 'Primary Calendar' : calendar.accessRole}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`calendar-${calendar.id}`}
                        checked={calendar.enabled}
                        onCheckedChange={(checked) => toggleCalendarVisibility(calendar.id, checked)}
                      />
                      <Label htmlFor={`calendar-${calendar.id}`}>
                        {calendar.enabled ? 'Visible' : 'Hidden'}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No calendars found. Try refreshing the calendar list.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarSettings;
