"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Task } from "@/types/task";
import { useEffect } from "react";

// Type cho activity log
export interface ActivityLog {
    id: number;
    task_id: number;
    task_title: string;
    action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'priority_changed' | 'due_date_changed';
    old_value?: string;
    new_value?: string;
    user_name?: string;
    created_at: string;
    task?: Task;
    changes_count?: number;
}

export function useNotifications() {
    const queryClient = useQueryClient();

    // Setup realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks'
                },
                (payload) => {
                    // Invalidate queries khi có thay đổi
                    queryClient.invalidateQueries({ queryKey: ["notifications", "due-soon"] });
                    queryClient.invalidateQueries({ queryKey: ["notifications", "recent-activities"] });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'task_activities'
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ["notifications", "recent-activities"] });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                } else if (status === 'CHANNEL_ERROR') {
                } else {
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Lấy tasks sắp hết hạn
    const dueSoonQuery = useQuery({
        queryKey: ["notifications", "due-soon"],
        queryFn: async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .neq("status", "done")
                .gte("due_date", today)
                .lte("due_date", tomorrow.toISOString().split('T')[0])
                .order("due_date", { ascending: true });

            if (error) throw error;
            return data as Task[];
        },
        refetchInterval: 5 * 60 * 1000, // Refresh mỗi 5 phút
    });

    // Lấy activity logs gần đây - chỉ lấy activity mới nhất của mỗi task
    const recentActivitiesQuery = useQuery({
        queryKey: ["notifications", "recent-activities"],
        queryFn: async () => {
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);

            // Lấy activity logs
            const { data: activities, error: activitiesError } = await supabase
                .from("task_activities")
                .select(`
                    *,
                    task:tasks(*)
                `)
                .gte("created_at", oneHourAgo.toISOString())
                .order("created_at", { ascending: false });

            if (activitiesError) {
                const { data: tasks, error: tasksError } = await supabase
                    .from("tasks")
                    .select("*")
                    .or(`updated_at.gte.${oneHourAgo.toISOString()},created_at.gte.${oneHourAgo.toISOString()}`)
                    .order("updated_at", { ascending: false, nullsFirst: false })
                    .limit(10);

                if (tasksError) throw tasksError;

                const now = Date.now();
                const taskActivities: ActivityLog[] = (tasks || [])
                    .filter(task => {
                        const updatedTime = task.updated_at ? new Date(task.updated_at).getTime() : 0;
                        const createdTime = task.created_at ? new Date(task.created_at).getTime() : 0;
                        const latestTime = Math.max(updatedTime, createdTime);
                        return (now - latestTime) < (60 * 60 * 1000);
                    })
                    .map(task => {
                        const isUpdated = task.updated_at &&
                            new Date(task.updated_at) > new Date(task.created_at || "");

                        return {
                            id: task.id,
                            task_id: task.id,
                            task_title: task.title,
                            action: isUpdated ? 'updated' as const : 'created' as const,
                            new_value: isUpdated ? task.status : undefined,
                            user_name: task.assignee || 'Unknown',
                            created_at: isUpdated ? task.updated_at! : task.created_at!,
                            task: task
                        };
                    });

                return taskActivities;
            }

            const groupedActivities = new Map<number, ActivityLog>();

            for (const activity of activities as ActivityLog[]) {
                const activityTime = new Date(activity.created_at).getTime();
                const existing = groupedActivities.get(activity.task_id);

                if (!existing) {
                    groupedActivities.set(activity.task_id, activity);
                } else {
                    const existingTime = new Date(existing.created_at).getTime();

                    if (Math.abs(activityTime - existingTime) > (5 * 60 * 1000)) {
                        const uniqueKey = activity.task_id * 1000000 + Math.floor(activityTime / 1000);
                        groupedActivities.set(uniqueKey, activity);
                    } else if (activityTime > existingTime) {
                        const combinedActivity = {
                            ...activity,
                            action: 'updated' as const,
                            old_value: existing.old_value,
                        };
                        groupedActivities.set(activity.task_id, combinedActivity);
                    }
                }
            }

            // Convert Map về Array và sort theo thời gian
            const result = Array.from(groupedActivities.values())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10);

            return result;
        },
        refetchInterval: 30 * 1000, // Refresh mỗi 30 giây
    });

    const dueSoonTasks = dueSoonQuery.data || [];
    const recentActivities = recentActivitiesQuery.data || [];

    const totalNotifications = dueSoonTasks.length + recentActivities.length;

    return {
        dueSoonTasks,
        recentActivities,
        totalNotifications,
        isLoading: dueSoonQuery.isLoading || recentActivitiesQuery.isLoading,
    };
}