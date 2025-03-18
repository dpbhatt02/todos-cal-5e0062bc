
/**
 * Simplified timezone utility functions for consistent date/time handling across the app
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

// Convert a date and time string to a Date object
// This function will create a proper Date object in the user's timezone
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
      // For date-only, set time to 00:00:00 but preserve date only in database
      // Use UTC to avoid timezone shifts
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.toISOString();
    }
    
    // Parse the time string (HH:mm)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time components:', timeString);
      return null;
    }
    
    // Create a local date object with the specified date and time
    const localDate = new Date();
    localDate.setFullYear(year, month - 1, day);
    localDate.setHours(hours, minutes, 0, 0);
    
    console.log(`Creating local datetime: ${localDate.toISOString()} for ${year}-${month}-${day} ${hours}:${minutes}`);
    
    // Return ISO string which will include timezone information
    return localDate.toISOString();
  } catch (error) {
    console.error('Error converting date and time to ISO:', error, dateString, timeString);
    return null;
  }
};
