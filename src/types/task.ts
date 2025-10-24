export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  due_date?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  user_id?: string | null
}

export interface Column {
  id: string;
  title: string;
  status: Task['status'];
  tasks: Task[];
}