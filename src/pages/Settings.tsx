
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import CalendarSettings from "@/components/settings/CalendarSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for success or error from Google Calendar callback
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const source = searchParams.get('source');
    
    if (success === 'true' && source === 'google_calendar') {
      toast.success('Google Calendar connected successfully');
      setActiveTab('calendars');
    } else if (error && source === 'google_calendar') {
      toast.error(`Failed to connect Google Calendar: ${error}`);
      setActiveTab('calendars');
    }
    
    // Check localStorage for an active tab setting
    const savedTab = window.localStorage.getItem('settings-active-tab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Clear the localStorage item after using it
      window.localStorage.removeItem('settings-active-tab');
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-4 md:py-6 px-2 md:px-6 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
      
      <Tabs 
        defaultValue="general" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className={`grid grid-cols-3 w-full mb-6 ${isMobile ? 'sticky top-0 z-10' : ''}`}>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="calendars">Calendars</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="calendars">
          <CalendarSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
