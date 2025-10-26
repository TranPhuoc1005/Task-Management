// src/types/notification.ts
import { Task } from "@/types/task";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "assigned"
  | "priority_changed"
  | "due_date_changed";

export interface ActivityLog {
  id: number;
  task_id: number;
  task_title: string;
  action: ActivityAction;
  old_value?: string;
  new_value?: string;
  user_name?: string;
  created_at: string;
  task?: Task;
  changes_count?: number;
}

export interface NotificationsResponse {
  dueSoonTasks: Task[];
  recentActivities: ActivityLog[];
  totalNotifications: number;
}
