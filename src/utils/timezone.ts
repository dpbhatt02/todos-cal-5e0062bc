
/**
 * Timezone utility functions for consistent date/time handling across the app
 */

// Get the user's timezone from browser or context
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
    if (!date) return '';
    
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
    if (!date) return '';
    
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
    if (!date) return '';
    
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    
    // Get the timezone
    const tz = timezone || getLocalTimezone();
    
    // Format the date in ISO format with the timezone offset
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false,
      timeZone: tz
    });
    
    const parts = formatter.formatToParts(dateObject);
    const dateParts = {
      year: parts.find(part => part.type === 'year')?.value || '',
      month: parts.find(part => part.type === 'month')?.value || '',
      day: parts.find(part => part.type === 'day')?.value || '',
      hour: parts.find(part => part.type === 'hour')?.value || '',
      minute: parts.find(part => part.type === 'minute')?.value || '',
      second: parts.find(part => part.type === 'second')?.value || ''
    };
    
    // Get timezone offset string
    const tzOffset = getTimezoneOffsetString(tz);
    
    // Create the ISO string with timezone
    return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}${tzOffset}`;
  } catch (error) {
    console.error('Error converting to ISO with timezone:', error);
    
    // Fallback to standard ISO
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return dateObject.toISOString();
  }
};

// Convert a date string with a time string to an ISO string with timezone
export const dateAndTimeToISOWithTimezone = (
  dateString: string, 
  timeString: string | null,
  timezone?: string
): string | null => {
  if (!dateString) return null;
  
  try {
    // Get user's timezone
    const tz = timezone || getLocalTimezone();
    console.log('Using timezone for conversion:', tz);
    
    if (!timeString) {
      // If no time provided, set to 00:00:00 in the user's timezone
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // Set to midnight in the user's timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        timeZone: tz
      });
      
      const parts = formatter.formatToParts(date);
      const dateParts = {
        year: parts.find(part => part.type === 'year')?.value || '',
        month: parts.find(part => part.type === 'month')?.value || '',
        day: parts.find(part => part.type === 'day')?.value || '',
      };
      
      // Get timezone offset string
      const tzOffset = getTimezoneOffsetString(tz);
      
      // Create the ISO string with timezone
      return `${dateParts.year}-${dateParts.month}-${dateParts.day}T00:00:00${tzOffset}`;
    }
    
    // Combine date and time
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create a date object from the input date string
    const dateParts = dateString.split('-').map(Number);
    // JavaScript months are 0-indexed
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes);
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date created from inputs:', dateString, timeString);
      return null;
    }
    
    // Format with timezone information
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: tz
    });
    
    const formattedParts = formatter.formatToParts(dateObj);
    const finalDateParts = {
      year: formattedParts.find(part => part.type === 'year')?.value || '',
      month: formattedParts.find(part => part.type === 'month')?.value || '',
      day: formattedParts.find(part => part.type === 'day')?.value || '',
      hour: formattedParts.find(part => part.type === 'hour')?.value || '',
      minute: formattedParts.find(part => part.type === 'minute')?.value || '',
    };
    
    // Get timezone offset string
    const tzOffset = getTimezoneOffsetString(tz);
    
    // Create the ISO string with timezone
    const isoString = `${finalDateParts.year}-${finalDateParts.month}-${finalDateParts.day}T${finalDateParts.hour}:${finalDateParts.minute}:00${tzOffset}`;
    console.log(`Converted date ${dateString} and time ${timeString} to ISO: ${isoString}`);
    
    return isoString;
  } catch (error) {
    console.error('Error converting date and time to ISO:', error, dateString, timeString);
    return null;
  }
};
