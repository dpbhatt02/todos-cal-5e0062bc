
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { format, subMinutes } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonCustom } from "@/components/ui/button-custom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTasksContext } from '@/contexts/TasksContext';

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  taskId: string;
}

interface NotificationsPopoverProps {
  isSidebarOpen: boolean;
}

const NotificationsPopover = ({ isSidebarOpen }: NotificationsPopoverProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { tasks } = useTasksContext();

  // Generate notifications based on tasks
  useEffect(() => {
    if (!tasks) return;
    
    const now = new Date();
    const newNotifications: Notification[] = [];
    
    tasks.forEach(task => {
      if (task.completed) return;
      
      const taskDate = new Date(task.dueDate);
      const isAllDay = !task.startTime || !task.endTime;
      
      // For all-day tasks, notify on the due date
      // For timed tasks, notify 30 minutes before start time
      const notificationTime = isAllDay 
        ? taskDate 
        : subMinutes(new Date(`${task.dueDate}T${task.startTime}`), 30);
      
      // Only create notification if the time is within +/- 1 hour of now
      // In a real app, this would be more sophisticated and persistent
      const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());
      if (timeDiff <= 60 * 60 * 1000) { // 1 hour in milliseconds
        newNotifications.push({
          id: `task-notification-${task.id}`,
          title: `Task reminder${isAllDay ? '' : ' (starting soon)'}`,
          description: task.title,
          time: notificationTime,
          read: false,
          taskId: task.id
        });
      }
    });
    
    setNotifications(newNotifications);
  }, [tasks]);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      duration: 3000
    });
    setOpen(false);
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // In a real app, this would navigate to the task
    console.log(`Navigate to task: ${notification.taskId}`);
    markAsRead(notification.id);
  };

  const renderNotificationItem = (notification: Notification) => (
    <div 
      key={notification.id}
      className={`p-3 border-b border-border/40 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-sm">
          {notification.title}
          {!notification.read && (
            <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(notification.time, 'h:mm a')}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{notification.description}</p>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className={`${isSidebarOpen ? 'w-8 h-8' : 'w-10 h-10'} bg-transparent hover:bg-muted/50 rounded-full flex items-center justify-center relative transition-colors duration-200`}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span 
              className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-medium text-white bg-priority-high rounded-full"
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 p-0 bg-popover shadow-lg"
        sideOffset={15}
      >
        <div className="flex items-center justify-between p-3 border-b border-border/40">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <ButtonCustom 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-7 px-2"
            >
              Mark all as read
            </ButtonCustom>
          )}
        </div>
        
        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="flex w-full rounded-none bg-transparent border-b border-border/40">
            <TabsTrigger 
              value="unread" 
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground rounded-none"
            >
              Unread
              {unreadCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-muted text-muted-foreground"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground rounded-none"
            >
              All
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[300px]">
              {notifications.filter(n => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <p className="text-sm text-muted-foreground mb-2">No unread notifications</p>
                </div>
              ) : (
                notifications
                  .filter(n => !n.read)
                  .map(renderNotificationItem)
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <p className="text-sm text-muted-foreground mb-2">No notifications</p>
                </div>
              ) : (
                notifications.map(renderNotificationItem)
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
