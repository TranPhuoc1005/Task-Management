export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  due_date?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Column {
  id: string;
  title: string;
  status: Task['status'];
  tasks: Task[];
}