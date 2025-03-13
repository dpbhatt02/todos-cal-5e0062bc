
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, CheckCircle2, Calendar, Plus, RefreshCw } from "lucide-react";

// Types for calendar data
interface CalendarItem {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

export const CalendarSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [calendars, setCalendars] = useState<CalendarItem[]>([
    { id: "1", name: "Personal", color: "#4285F4", enabled: true },
    { id: "2", name: "Work", color: "#DB4437", enabled: true },
    { id: "3", name: "Family", color: "#0F9D58", enabled: false },
    { id: "4", name: "Holidays", color: "#F4B400", enabled: true },
  ]);
  
  const handleConnect = () => {
    // In a real app, this would open OAuth flow
    console.log("Connecting to Google Calendar...");
    setIsConnected(true);
  };
  
  const handleDisconnect = () => {
    // In a real app, this would revoke access
    console.log("Disconnecting from Google Calendar...");
    setIsConnected(false);
  };
  
  const handleSyncToggle = (id: string) => {
    setCalendars(calendars.map(cal => 
      cal.id === id ? { ...cal, enabled: !cal.enabled } : cal
    ));
  };
  
  const handleSync = () => {
    // In a real app, this would trigger a calendar sync
    console.log("Syncing calendars...");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Calendar Integration</span>
          </CardTitle>
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
              <Button onClick={handleConnect} className="mt-4 gap-2">
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
                Connect Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Connected to Google Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    Using john.doe@gmail.com
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSync}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Calendar Selection</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Calendar
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {calendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: calendar.color }}
                        />
                        <span>{calendar.name}</span>
                      </div>
                      <Switch 
                        checked={calendar.enabled} 
                        onCheckedChange={() => handleSyncToggle(calendar.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
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
