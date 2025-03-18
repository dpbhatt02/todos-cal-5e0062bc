
export interface TaskHistory {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'synced';
  details: string;
  timestamp: string;
  created_at: string;
}
