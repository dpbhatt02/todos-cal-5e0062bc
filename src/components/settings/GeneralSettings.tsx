
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Home, Bell, Moon, Sun, Save, Monitor } from "lucide-react";
import { toast } from "sonner";

export const GeneralSettings = () => {
  const [defaultView, setDefaultView] = useState("dashboard");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // Initialize settings based on localStorage or document class on component mount
  useEffect(() => {
    // Check if dark mode is active in the document
    const isDarkMode = document.documentElement.classList.contains("dark");
    setDarkMode(isDarkMode);
    
    // Check for desktop notification permissions
    if ("Notification" in window) {
      setDesktopNotifications(Notification.permission === "granted");
    }
    
    // Initialize compact view from localStorage
    const storedCompactView = localStorage.getItem("compactView") === "true";
    setCompactView(storedCompactView);
    
    if (storedCompactView) {
      document.documentElement.classList.add("compact");
    } else {
      document.documentElement.classList.remove("compact");
    }
  }, []);

  // Update dark mode when the state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  
  // Update compact view when the state changes
  useEffect(() => {
    if (compactView) {
      document.documentElement.classList.add("compact");
      localStorage.setItem("compactView", "true");
    } else {
      document.documentElement.classList.remove("compact");
      localStorage.setItem("compactView", "false");
    }
  }, [compactView]);

  const handleSave = () => {
    // In a real app, this would save to a database or localStorage
    console.log({
      defaultView,
      notifications,
      emailNotifications,
      desktopNotifications,
      darkMode,
      compactView
    });
    
    // Show success toast
    toast.success("Settings saved successfully!");
  };

  const handleDesktopNotificationsChange = async (checked: boolean) => {
    if (!("Notification" in window)) {
      toast.error("Desktop notifications are not supported in your browser");
      return;
    }
    
    if (checked && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setDesktopNotifications(true);
        toast.success("Desktop notifications enabled!");
        // Show a test notification
        new Notification("Task Manager", {
          body: "Desktop notifications are now enabled!",
          icon: "/favicon.ico"
        });
      } else {
        setDesktopNotifications(false);
        toast.error("Permission for desktop notifications was denied");
      }
    } else {
      setDesktopNotifications(checked);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>View Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure how you want the application to look and behave.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-view">Default Home View</Label>
              <Select value={defaultView} onValueChange={setDefaultView}>
                <SelectTrigger id="default-view">
                  <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="tasks">Task List</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                  <SelectItem value="kanban">Kanban Board</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-view">Compact View</Label>
                <Switch 
                  id="compact-view" 
                  checked={compactView} 
                  onCheckedChange={setCompactView} 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Show more content with less spacing
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-muted-foreground" />
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={setDarkMode} 
              />
              <Moon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-notifications">App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications in the app
              </p>
            </div>
            <Switch 
              id="app-notifications" 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your desktop when the app is in the background
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <Switch 
                id="desktop-notifications" 
                checked={desktopNotifications} 
                onCheckedChange={handleDesktopNotificationsChange} 
              />
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important events
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
