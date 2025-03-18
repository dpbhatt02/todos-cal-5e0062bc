import { format } from 'date-fns';
import { 
  formatDateInTimezone, 
  formatTimeInTimezone, 
  getLocalTimezone 
} from '@/utils/timezone';

export const formatDate = (date: Date | string) => {
  // Use our timezone utility instead of basic formatting
  return formatDateInTimezone(date);
};

export const formatFullDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = format(dateObj, 'd');
  const month = format(dateObj, 'MMM');
  const year = format(dateObj, 'yyyy');
  const dayName = format(dateObj, 'EEEE');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (dateObj.getTime() === today.getTime()) {
    return `${day} ${month}, ${year} · Today`;
  } else if (dateObj.getTime() === tomorrow.getTime()) {
    return `${day} ${month}, ${year} · Tomorrow`;
  } else {
    return `${day} ${month}, ${year} · ${dayName}`;
  }
};

export const getRecurringLabel = (frequency?: 'daily' | 'weekly' | 'monthly' | 'custom') => {
  if (!frequency) return '';
  
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return 'Custom';
    default:
      return '';
  }
};

// Format time consistently with user's timezone
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    // If it contains a 'T', it's likely an ISO string
    if (timeString.includes('T')) {
      return formatTimeInTimezone(timeString);
    }
    
    // Otherwise it's just a time string, construct a full date to format
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return formatTimeInTimezone(date);
  } catch (err) {
    console.error('Error formatting time:', err);
    return timeString;
  }
};

// Get the current timezone information for display
export const getCurrentTimezone = (): { name: string, offset: string } => {
  try {
    const timezone = getLocalTimezone();
    
    // Get current date in the timezone
    const date = new Date();
    
    // Get timezone name
    const timeZoneName = new Intl.DateTimeFormat('en-US', { 
      timeZone: timezone, 
      timeZoneName: 'long'
    }).formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value || timezone;
    
    // Get timezone offset
    const formatter = new Intl.DateTimeFormat('en-GB', { 
      timeZone: timezone, 
      timeZoneName: 'short' 
    });
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    const offsetString = timeZonePart?.value || '';
    
    return {
      name: timeZoneName,
      offset: offsetString
    };
  } catch (error) {
    console.error('Error getting current timezone info:', error);
    return {
      name: 'Unknown',
      offset: ''
    };
  }
};
