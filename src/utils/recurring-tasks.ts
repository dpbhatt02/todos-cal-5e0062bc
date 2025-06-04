
import { addDays, format } from 'date-fns';
import { TaskProps } from '@/components/tasks/types';

/**
 * Schedules the next occurrence of a recurring task
 */
export const scheduleNextOccurrence = async (task: TaskProps) => {
  if (!task.recurring || !task.recurring.frequency) {
    console.warn('Attempted to schedule next occurrence for non-recurring task');
    return null;
  }
  
  console.log('Scheduling next occurrence for task:', task.id, 'with frequency:', task.recurring.frequency);
  console.log('Original task time settings:', {
    startTime: task.startTime,
    endTime: task.endTime,
    isAllDay: task.isAllDay
  });
  
  let nextDate = new Date(task.dueDate);
  
  // Calculate next occurrence date based on frequency
  switch (task.recurring.frequency) {
    case 'daily':
      nextDate = addDays(nextDate, 1);
      break;
    case 'weekly':
      nextDate = addDays(nextDate, 7);
      break;
    case 'monthly':
      // Add one month (approximately)
      nextDate = new Date(
        nextDate.getFullYear(),
        nextDate.getMonth() + 1,
        nextDate.getDate()
      );
      break;
    case 'custom':
      // For custom frequency, add minimum days (e.g., 1 day)
      // This is a simplification - in a real app, you'd implement more complex logic
      nextDate = addDays(nextDate, 1);
      break;
    default:
      console.warn('Unknown recurring frequency:', task.recurring.frequency);
      nextDate = addDays(nextDate, 1);
  }
  
  console.log('Next occurrence date calculated:', format(nextDate, 'yyyy-MM-dd'));
  
  // Check if we've reached the end date or max occurrences
  if (task.recurring.endDate && nextDate > new Date(task.recurring.endDate)) {
    console.log('Reached end date for recurring task:', task.id);
    return null; // No more occurrences
  }
  
  // Create a new task object for the next occurrence
  // Important: We need to create a complete TaskProps with all necessary fields
  const updatedTask = {
    ...task,
    id: task.id, // Keep the same ID
    dueDate: nextDate,
    completed: false, // Reset completed status
    // IMPORTANT: Preserve exact time settings
    startTime: task.startTime,
    endTime: task.endTime,
    isAllDay: task.isAllDay !== undefined ? task.isAllDay : true
  };
  
  console.log('Next occurrence time settings:', {
    startTime: updatedTask.startTime,
    endTime: updatedTask.endTime,
    isAllDay: updatedTask.isAllDay
  });
  
  console.log('Rescheduling task to:', updatedTask);
  return updatedTask;
};

/**
 * Helper function to convert time to 24-hour format
 * Improved to handle more formats including "1:30PM" style times
 */
export const convertTo24HourFormat = (timeString: string): string => {
  console.log('convert to 24 hours format function called, timestring:',timeString);
  if (!timeString) return '';
  
  // If already in 24-hour format (e.g., "14:30"), return as is
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
    console.log('Already in 24h format condition.');
    return timeString;
  }

  try {
    // Handle AM/PM formats like "1:30PM", "2:00 PM", etc.
    // First, clean up by removing spaces
    const cleanTimeString = timeString.replace(/\s/g, '');
    console.log('clean time string',cleanTimeString);
    // Extract hours, minutes, and AM/PM indicator with regex
    // This pattern matches formats like "1:30PM", "2:00AM", "9:45pm"
    const amPmMatch = cleanTimeString.match(/^(\d+):(\d+)(?::\d+)?(?:\s*)?(AM|PM|am|pm)$/i);
    console.log('am pm match: ',amPmMatch);
    if (amPmMatch) {
      let [_, hours, minutes, period] = amPmMatch;
      let hoursNum = parseInt(hours, 10);
      
      // Convert hours based on AM/PM
      if (period.toUpperCase() === 'PM' && hoursNum < 12) {
        hoursNum += 12;
        console.log('pm hour num:',hoursNum);
      } else if (period.toUpperCase() === 'AM' && hoursNum === 12) {
        hoursNum = 0;
        console.log('am hour num:',hoursNum);
      }
      
      // Format as HH:MM, padding minutes to two digits
      return `${hoursNum.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    // If the first pattern didn't match, try a more lenient approach
    // Extract numeric parts and assume AM/PM suffix
    const genericMatch = cleanTimeString.match(/^(\d+)[:\.]?(\d*)(?:\s*)?(AM|PM|am|pm)?$/i);
    
    if (genericMatch) {
      let [_, hours, minutes, period] = genericMatch;
      let hoursNum = parseInt(hours, 10);
      const minutesNum = minutes ? parseInt(minutes, 10) : 0;
      
      // Default to 00 minutes if not provided
      const formattedMinutes = minutes ? minutes.padStart(2, '0') : '00';
      
      // Handle AM/PM conversion
      if (period && period.toUpperCase() === 'PM' && hoursNum < 12) {
        hoursNum += 12;
      } else if (period && period.toUpperCase() === 'AM' && hoursNum === 12) {
        hoursNum = 0;
      }
      
      return `${hoursNum.toString().padStart(2, '0')}:${formattedMinutes}`;
    }
  } catch (error) {
    console.error("Error converting time format:", error, timeString);
  }
  
  // If we can't parse it, log a warning and return a default value
  console.warn(`Could not parse time string: "${timeString}". Returning default.`);
  return '09:00'; // Return a safe default rather than the original unparseable string
};

/**
 * Helper function to prepare time values for the time input field
 */
export const prepareTimeForInput = (timeString?: string | null): string => {
  if (!timeString) return '';
  
  // Remove any AM/PM indicator and convert to 24-hour format
  return convertTo24HourFormat(timeString);
};
