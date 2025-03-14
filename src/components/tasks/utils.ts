
import { format } from 'date-fns';

export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
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

// Format dates for Google Calendar
export const formatGoogleCalendarDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

// Ensure proper ISO string for dates going to the database
export const ensureDateFormat = (dateStr: string | Date): string => {
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    // Already in ISO format
    return dateStr;
  }
  
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateStr);
    return new Date().toISOString();
  }
  
  return date.toISOString();
};
