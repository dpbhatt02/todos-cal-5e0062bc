
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
export const formatDateInTimezone = (date: Date | string, timezone?: string): string => {
  try {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    // Use provided timezone or default to browser's timezone
    const tz = timezone || getLocalTimezone();
    
    // Format the date with the timezone
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: tz
    }).format(dateObject);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    
    // Fallback to basic formatting
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleDateString();
  }
};

// Format a time for display in the user's timezone
export const formatTimeInTimezone = (date: Date | string, timezone?: string): string => {
  try {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    // Use provided timezone or default to browser's timezone
    const tz = timezone || getLocalTimezone();
    
    // Format the time with the timezone
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: tz
    }).format(dateObject);
  } catch (error) {
    console.error('Error formatting time in timezone:', error);
    
    // Fallback to basic formatting
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toLocaleTimeString();
  }
};

// Get the timezone offset string (e.g., "+05:30") for a specific timezone
export const getTimezoneOffsetString = (timezone?: string): string => {
  try {
    // Use provided timezone or default to browser's timezone
    const tz = timezone || getLocalTimezone();
    
    // Create a date to get the timezone offset
    const date = new Date();
    
    // Get timezone offset in minutes for the specified timezone
    const options: Intl.DateTimeFormatOptions = { timeZone: tz, timeZoneName: 'short' };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    const timeZoneShort = timeZonePart?.value || '';
    
    // Parse the GMT offset from the short timezone name (e.g., "GMT+5:30")
    const match = timeZoneShort.match(/GMT([+-]\d+(?::\d+)?)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Fallback: calculate from browser's timezone
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

// Convert a date to ISO string with the user's timezone offset
export const toISOWithTimezone = (date: Date | string, timezone?: string): string => {
  try {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    // Get the date parts in local format
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');
    const seconds = dateObject.getSeconds().toString().padStart(2, '0');
    
    // Get timezone offset string
    const tzOffset = getTimezoneOffsetString(timezone);
    
    // Format as ISO with timezone
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzOffset}`;
  } catch (error) {
    console.error('Error converting to ISO with timezone:', error);
    
    // Fallback to standard ISO
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toISOString();
  }
};
