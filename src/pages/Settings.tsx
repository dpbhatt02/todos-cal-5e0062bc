
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { CalendarSettings } from "@/components/settings/CalendarSettings";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    // Check localStorage for an active tab setting
    const savedTab = window.localStorage.getItem('settings-active-tab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Clear the localStorage item after using it
      window.localStorage.removeItem('settings-active-tab');
    }
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs 
        defaultValue="general" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full mb-8">
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
