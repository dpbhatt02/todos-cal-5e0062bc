
import { format } from 'date-fns';
import { 
  formatDateInTimezone, 
  formatTimeInTimezone, 
  getLocalTimezone,
  dateAndTimeToISOWithTimezone
} from '@/utils/timezone';
import { convertTo24HourFormat } from '@/utils/recurring-tasks';

export const formatDate = (date: Date | string) => {
  if (!date) return '';
  
  // Use our timezone utility instead of basic formatting
  return formatDateInTimezone(date);
};

export const formatFullDate = (date: Date | string) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Get date parts in user's timezone
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  
  // Get day of week in user's timezone
  const dayName = dateObj.toLocaleString('en-US', { weekday: 'long' });
  
  // Check if it's today or tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = dateObj.getDate() === today.getDate() && 
                  dateObj.getMonth() === today.getMonth() && 
                  dateObj.getFullYear() === today.getFullYear();
  
  const isTomorrow = dateObj.getDate() === tomorrow.getDate() && 
                     dateObj.getMonth() === tomorrow.getMonth() && 
                     dateObj.getFullYear() === tomorrow.getFullYear();
  
  if (isToday) {
    return `${day} ${month}, ${year} · Today`;
  } else if (isTomorrow) {
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

// Format time consistently with standard browser APIs
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    // If it contains a 'T', it's likely an ISO string
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(/\s/g, '');
    }
    
    // First convert to 24-hour format
    const time24h = convertTo24HourFormat(timeString);
    
    // Then convert to a Date object and format consistently
    const [hours, minutes] = time24h.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\s/g, '');
  } catch (err) {
    console.error('Error formatting time:', err, timeString);
    return timeString;
  }
};

// Get the current timezone information for display
export const getCurrentTimezone = (): { name: string, offset: string } => {
  try {
    const date = new Date();
    
    // Get timezone name
    const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get timezone offset as string
    const offsetMinutes = date.getTimezoneOffset();
    const hours = Math.abs(Math.floor(offsetMinutes / 60));
    const minutes = Math.abs(offsetMinutes % 60);
    const sign = offsetMinutes <= 0 ? '+' : '-'; // Note: getTimezoneOffset returns inverted sign
    const offsetString = `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
    
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

// Convert a form date and time to an ISO string
export const formDateTimeToISO = (dateStr: string, timeStr: string | null): string | null => {
  if (!dateStr) return null;
  
  // Ensure time is in 24-hour format before passing to timezone utility
  const formattedTimeStr = timeStr ? convertTo24HourFormat(timeStr) : null;
  
  return dateAndTimeToISOWithTimezone(dateStr, formattedTimeStr);
};
