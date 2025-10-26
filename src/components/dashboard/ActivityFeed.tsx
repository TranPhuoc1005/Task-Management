"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CheckSquare, Edit, Trash2, UserPlus, Clock } from "lucide-react";
import { ActivityLog } from "@/types/notifications";

export default function ActivityFeed() {
    // Lấy 10 activities gần nhất
    const { data: activities, isLoading } = useQuery({
        queryKey: ["dashboard", "activities"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("task_activities")
                .select(
                    `
                    *,
                    task:tasks(*)
                `
                )
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) throw error;
            return data as ActivityLog[];
        },
        refetchInterval: 30 * 1000, // Refresh mỗi 30 giây
    });

    const getActivityIcon = (action: string) => {
        switch (action) {
            case "created":
                return { icon: CheckSquare, color: "bg-green-100 text-green-600" };
            case "updated":
                return { icon: Edit, color: "bg-blue-100 text-blue-600" };
            case "status_changed":
                return { icon: CheckSquare, color: "bg-purple-100 text-purple-600" };
            case "deleted":
                return { icon: Trash2, color: "bg-red-100 text-red-600" };
            case "assigned":
                return { icon: UserPlus, color: "bg-orange-100 text-orange-600" };
            default:
                return { icon: Clock, color: "bg-slate-100 text-slate-600" };
        }
    };

    const getActivityText = (activity: ActivityLog) => {
        const userName = activity.user_name || "Someone";

        switch (activity.action) {
            case "created":
                return `${userName} created task`;
            case "updated":
                return `${userName} updated task`;
            case "status_changed":
                return `Status: ${activity.old_value} → ${activity.new_value}`;
            case "deleted":
                return `${userName} deleted task`;
            case "assigned":
                return `Assigned to ${activity.new_value}`;
            case "priority_changed":
                return `Priority: ${activity.old_value} → ${activity.new_value}`;
            default:
                return `${userName} modified task`;
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = Date.now();
        const activityDate = new Date(date).getTime();
        const diff = now - activityDate;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Activity</h2>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const iconInfo = getActivityIcon(activity.action);
                        const Icon = iconInfo.icon;

                        return (
                            <div key={activity.id} className="flex items-start space-x-3">
                                <div
                                    className={`w-8 h-8 ${iconInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900 font-medium truncate">{activity.task_title}</p>
                                    <p className="text-xs text-slate-600 mt-0.5">{getActivityText(activity)}</p>
                                    <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No recent activity</p>
                </div>
            )}
        </div>
    );
}
