
import { addDays } from 'date-fns';
import { TaskProps } from './types';

// Create a base date starting from March 13, 2025
const baseDate = new Date('2025-03-13');

// Function to add days to the base date and format as string
const getDateString = (daysToAdd: number) => {
  return addDays(new Date(baseDate), daysToAdd).toISOString().split('T')[0];
};

// Sample tasks data with additional tasks from March 13, 2025 onwards
export const mockTasks: TaskProps[] = [
  // March 13, 2025
  {
    id: '101',
    title: 'Project kickoff meeting',
    description: 'Initial meeting to launch the new marketing campaign',
    priority: 'high',
    dueDate: getDateString(0), // March 13
    completed: false,
    tags: ['work', 'meeting'],
    recurring: undefined
  },
  {
    id: '102',
    title: 'Daily standup',
    description: 'Team sync meeting to discuss ongoing tasks',
    priority: 'medium',
    dueDate: getDateString(0), // March 13
    completed: false,
    tags: ['work', 'meeting'],
    recurring: { frequency: 'daily' }
  },
  
  // March 14, 2025
  {
    id: '103',
    title: 'Review Q1 budget',
    description: 'Review expenses and plan for Q2',
    priority: 'high',
    dueDate: getDateString(1), // March 14
    completed: false,
    tags: ['work', 'finance'],
    recurring: undefined
  },
  {
    id: '104',
    title: 'Weekly team lunch',
    description: 'Team-building activity',
    priority: 'low',
    dueDate: getDateString(1), // March 14
    completed: false,
    tags: ['work', 'personal'],
    recurring: { frequency: 'weekly' }
  },
  
  // March 15, 2025
  {
    id: '105',
    title: 'Weekend yoga class',
    description: '90-minute yoga session at the wellness center',
    priority: 'medium',
    dueDate: getDateString(2), // March 15
    completed: false,
    tags: ['health', 'personal'],
    recurring: { frequency: 'weekly', customDays: ['Saturday'] }
  },
  
  // March 16, 2025
  {
    id: '106',
    title: 'Call parents',
    description: 'Weekly family call',
    priority: 'medium',
    dueDate: getDateString(3), // March 16
    completed: false,
    tags: ['personal', 'family'],
    recurring: { frequency: 'weekly', customDays: ['Sunday'] }
  },
  
  // March 17, 2025
  {
    id: '107',
    title: 'Prepare client presentation',
    description: 'Create slides for the quarterly review',
    priority: 'high',
    dueDate: getDateString(4), // March 17
    completed: false,
    tags: ['work', 'client'],
    recurring: undefined
  },
  {
    id: '108',
    title: 'Team retrospective',
    description: 'Monthly review of team processes and achievements',
    priority: 'medium',
    dueDate: getDateString(4), // March 17
    completed: false,
    tags: ['work', 'meeting'],
    recurring: { frequency: 'monthly' }
  },
  
  // March 18, 2025
  {
    id: '109',
    title: 'Doctor appointment',
    description: 'Annual health checkup',
    priority: 'high',
    dueDate: getDateString(5), // March 18
    completed: false,
    tags: ['health', 'personal'],
    recurring: undefined
  },
  
  // March 19, 2025
  {
    id: '110',
    title: 'Submit expense report',
    description: 'Monthly expense submission',
    priority: 'medium',
    dueDate: getDateString(6), // March 19
    completed: false,
    tags: ['work', 'finance'],
    recurring: { frequency: 'monthly' }
  },
  
  // March 20, 2025
  {
    id: '111',
    title: 'Client meeting',
    description: 'Status update call with major client',
    priority: 'high',
    dueDate: getDateString(7), // March 20
    completed: false,
    tags: ['work', 'client', 'meeting'],
    recurring: { frequency: 'custom', customDays: ['Thursday'] }
  },
  
  // March 21, 2025
  {
    id: '112',
    title: 'Code review session',
    description: 'Review pull requests from the development team',
    priority: 'medium',
    dueDate: getDateString(8), // March 21
    completed: false,
    tags: ['work', 'development'],
    recurring: { frequency: 'weekly', customDays: ['Friday'] }
  },
  
  // March 22, 2025
  {
    id: '113',
    title: 'Weekend grocery shopping',
    description: 'Get groceries for the coming week',
    priority: 'medium',
    dueDate: getDateString(9), // March 22
    completed: false,
    tags: ['personal', 'errands'],
    recurring: { frequency: 'weekly', customDays: ['Saturday'] }
  },
  
  // March 24, 2025
  {
    id: '114',
    title: 'Start new online course',
    description: 'Begin the AI fundamentals course',
    priority: 'low',
    dueDate: getDateString(11), // March 24
    completed: false,
    tags: ['learning', 'personal'],
    recurring: undefined
  },
  
  // March 25, 2025
  {
    id: '115',
    title: 'Pay rent',
    description: 'Transfer monthly rent payment',
    priority: 'high',
    dueDate: getDateString(12), // March 25
    completed: false,
    tags: ['finance', 'personal'],
    recurring: { frequency: 'monthly' }
  },
  
  // March 26, 2025
  {
    id: '116',
    title: 'Book club meeting',
    description: 'Discussion of this month\'s book',
    priority: 'low',
    dueDate: getDateString(13), // March 26
    completed: false,
    tags: ['personal', 'social'],
    recurring: { frequency: 'monthly' }
  },
  
  // March 27, 2025
  {
    id: '117',
    title: 'Quarterly business review',
    description: 'Review Q1 performance metrics',
    priority: 'high',
    dueDate: getDateString(14), // March 27
    completed: false,
    tags: ['work', 'meeting', 'finance'],
    recurring: undefined
  },
  
  // March 28, 2025
  {
    id: '118',
    title: 'Car maintenance',
    description: 'Take car in for regular service',
    priority: 'medium',
    dueDate: getDateString(15), // March 28
    completed: false,
    tags: ['personal', 'errands'],
    recurring: undefined
  },
  
  // April 1, 2025
  {
    id: '119',
    title: 'Update project roadmap',
    description: 'Revise and share Q2 roadmap with stakeholders',
    priority: 'high',
    dueDate: getDateString(19), // April 1
    completed: false,
    tags: ['work', 'planning'],
    recurring: undefined
  },
  
  // April 3, 2025
  {
    id: '120',
    title: 'Dentist appointment',
    description: 'Regular dental checkup',
    priority: 'medium',
    dueDate: getDateString(21), // April 3
    completed: false,
    tags: ['health', 'personal'],
    recurring: { frequency: 'custom', endAfter: 1 }
  }
];
