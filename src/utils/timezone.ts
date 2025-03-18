
/**
 * Timezone utility functions for consistent date/time handling across the app
 */

// Get the user's timezone from browser
export const getLocalTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'UTC';
  }
};

// Format a date for display in the user's timezone
export const formatDateInTimezone = (date: Date | string): string => {
  try {
    if (!date) return '';
    
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    // Format the date with the timezone
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObject);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    
    // Fallback to basic formatting
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleDateString();
  }
};

// Format a time for display in the user's timezone
export const formatTimeInTimezone = (date: Date | string): string => {
  try {
    if (!date) return '';
    
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    // Format the time with the timezone
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(dateObject);
  } catch (error) {
    console.error('Error formatting time in timezone:', error);
    
    // Fallback to basic formatting
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleTimeString();
  }
};

// Get the timezone offset string (e.g., "+05:30")
export const getTimezoneOffsetString = (): string => {
  try {
    const date = new Date();
    const offsetMinutes = date.getTimezoneOffset();
    const hours = Math.abs(Math.floor(offsetMinutes / 60));
    const minutes = Math.abs(offsetMinutes % 60);
    const sign = offsetMinutes <= 0 ? '+' : '-'; // Note: getTimezoneOffset returns inverted sign
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return '+00:00'; // Default to UTC
  }
};

// Convert a date and time string to an ISO string with timezone
export const dateAndTimeToISOWithTimezone = (
  dateString: string, 
  timeString: string | null
): string | null => {
  if (!dateString) return null;
  
  try {
    // Create a date object from the input date string (yyyy-MM-dd)
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.error('Invalid date components:', dateString);
      return null;
    }
    
    if (!timeString) {
      // If no time provided, create date at 00:00:00 in local timezone
      const date = new Date(year, month - 1, day, 0, 0, 0);
      return date.toISOString();
    }
    
    // Parse the time string (HH:mm)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time components:', timeString);
      return null;
    }
    
    // Create a date with the specified date and time components
    const date = new Date(year, month - 1, day, hours, minutes, 0);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date created from inputs:', dateString, timeString);
      return null;
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date and time to ISO:', error, dateString, timeString);
    return null;
  }
};
