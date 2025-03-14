import { addDays } from 'date-fns';
import { TaskProps } from './types';

// Sample tasks data with additional tasks for upcoming days
export const mockTasks: TaskProps[] = [
  // Existing tasks
  {
    id: '1',
    title: 'Finalize project proposal',
    description: 'Complete the final draft of the project proposal with all required sections.',
    priority: 'high',
    dueDate: '2023-09-20',
    completed: false,
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up a team meeting to discuss the upcoming sprint goals and assignments.',
    priority: 'medium',
    dueDate: '2023-09-21',
    completed: false,
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '3',
    title: 'Gym workout',
    description: 'Complete 30-minute cardio and strength training session.',
    priority: 'low',
    dueDate: '2023-09-19',
    completed: true,
    tags: ['health', 'personal'],
    recurring: undefined
  },
  {
    id: '4',
    title: 'Read book chapter',
    description: 'Read chapter 5 of "Atomic Habits" and take notes.',
    priority: 'medium',
    dueDate: '2023-09-22',
    completed: false,
    tags: ['learning', 'personal'],
    recurring: undefined
  },
  {
    id: '5',
    title: 'Pay utility bills',
    description: 'Pay electricity, water, and internet bills before the due date.',
    priority: 'high',
    dueDate: '2023-09-19',
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '6',
    title: 'Daily review',
    description: 'Review tasks and plan for tomorrow.',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0], // Today's date
    completed: false,
    tags: ['work', 'personal'],
    recurring: { frequency: 'daily' }
  },
  // Additional tasks for coming days
  {
    id: '7',
    title: 'Client presentation',
    description: 'Present quarterly results to the client.',
    priority: 'high',
    dueDate: addDays(new Date(), 1).toISOString().split('T')[0], // Tomorrow
    completed: false,
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '8',
    title: 'Code review',
    description: 'Review pull requests from the team.',
    priority: 'medium',
    dueDate: addDays(new Date(), 1).toISOString().split('T')[0], // Tomorrow
    completed: false,
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '9',
    title: 'Update portfolio',
    description: 'Add recent projects to portfolio website.',
    priority: 'low',
    dueDate: addDays(new Date(), 2).toISOString().split('T')[0], // Day after tomorrow
    completed: false,
    tags: ['personal', 'learning'],
    recurring: undefined
  },
  {
    id: '10',
    title: 'Family dinner',
    description: 'Dinner with family at 7 PM.',
    priority: 'medium',
    dueDate: addDays(new Date(), 2).toISOString().split('T')[0], // Day after tomorrow
    completed: false,
    tags: ['personal'],
    recurring: undefined
  },
  {
    id: '11',
    title: 'Submit expense report',
    description: 'Compile and submit expense report for last month.',
    priority: 'high',
    dueDate: addDays(new Date(), 3).toISOString().split('T')[0], // 3 days from now
    completed: false,
    tags: ['work'],
    recurring: undefined
  },
  {
    id: '12',
    title: 'Weekly team sync',
    description: 'Sync with team on project progress.',
    priority: 'high',
    dueDate: addDays(new Date(), 3).toISOString().split('T')[0], // 3 days from now
    completed: false,
    tags: ['work'],
    recurring: { frequency: 'weekly' }
  },
  {
    id: '13',
    title: 'Research AI tools',
    description: 'Research new AI tools for productivity.',
    priority: 'medium',
    dueDate: addDays(new Date(), 4).toISOString().split('T')[0], // 4 days from now
    completed: false,
    tags: ['learning', 'work'],
    recurring: undefined
  },
  {
    id: '14',
    title: 'Dentist appointment',
    description: 'Regular checkup at dental clinic.',
    priority: 'medium',
    dueDate: addDays(new Date(), 5).toISOString().split('T')[0], // 5 days from now
    completed: false,
    tags: ['health'],
    recurring: undefined
  },
  {
    id: '15',
    title: 'Review quarterly goals',
    description: 'Check progress on Q3 goals and adjust as needed.',
    priority: 'high',
    dueDate: addDays(new Date(), 5).toISOString().split('T')[0], // 5 days from now
    completed: false,
    tags: ['work', 'personal'],
    recurring: undefined
  },
  {
    id: '16',
    title: 'Update resume',
    description: 'Add recent skills and experiences to resume.',
    priority: 'low',
    dueDate: addDays(new Date(), 5).toISOString().split('T')[0], // 5 days from now
    completed: false,
    tags: ['personal'],
    recurring: undefined
  }
];
