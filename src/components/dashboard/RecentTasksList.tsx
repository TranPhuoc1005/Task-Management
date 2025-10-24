"use client";

import { RecentTask } from "@/hook/useDashboard";
import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";

interface RecentTasksListProps {
    tasks: RecentTask[];
}

export default function RecentTasksList({ tasks }: RecentTasksListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "todo":
                return "bg-slate-100 text-slate-700";
            case "in-progress":
                return "bg-blue-100 text-blue-700";
            case "review":
                return "bg-purple-100 text-purple-700";
            case "done":
                return "bg-green-100 text-green-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "todo":
                return "To Do";
            case "in-progress":
                return "In Progress";
            case "review":
                return "Review";
            case "done":
                return "Done";
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-600";
            case "medium":
                return "text-yellow-600";
            case "low":
                return "text-blue-600";
            default:
                return "text-slate-600";
        }
    };

    const getDaysUntilDue = (dueDate?: string) => {
        if (!dueDate) return null;

        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "text-red-600" };
        if (diffDays === 0) return { text: "Due today", color: "text-orange-600" };
        if (diffDays === 1) return { text: "Due tomorrow", color: "text-yellow-600" };
        return { text: `Due in ${diffDays} days`, color: "text-slate-600" };
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Tasks</h2>
                <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all →
                </Link>
            </div>

            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">No tasks found</p>
                        <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                            Create your first task
                        </Link>
                    </div>
                ) : (
                    tasks.map((task) => {
                        const dueInfo = getDaysUntilDue(task.due_date);
                        const isOverdue = dueInfo?.text === "Overdue";

                        return (
                            <Link
                                key={task.id}
                                href={`/tasks?taskId=${task.id}`}
                                className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="font-medium text-slate-900 truncate">{task.title}</p>
                                        {isOverdue && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        {task.assignee && <span>👤 {task.assignee}</span>}
                                        {dueInfo && (
                                            <span className={`flex items-center gap-1 ${dueInfo.color}`}>
                                                <Clock className="w-3 h-3" />
                                                {dueInfo.text}
                                            </span>
                                        )}
                                        <span className={`uppercase font-semibold ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>

                                <span
                                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                                        task.status
                                    )}`}>
                                    {getStatusLabel(task.status)}
                                </span>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
