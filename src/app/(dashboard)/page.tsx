"use client";

import { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import TasksChart from "@/components/dashboard/TasksChart";
import RecentTasksList from "@/components/dashboard/RecentTasksList";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { useDashboard } from "@/hook/useDashboard";
import ExportButton from "@/components/dashboard/ExportButton";
import TaskTrendsChart from "@/components/dashboard/TaskTrendsChart";

export default function HomePage() {
    const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");
    const { stats, tasksByStatus, tasksByPriority, recentTasks, isLoading, error } = useDashboard();

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error loading dashboard data</p>
                </div>
            </div>
        );
    }

    const statsData = [
        {
            title: "Total Tasks",
            value: stats.totalTasks.toString(),
            change: stats.totalChange,
            icon: CheckSquare,
            color: "bg-blue-500",
        },
        {
            title: "In Progress",
            value: stats.inProgress.toString(),
            change: stats.inProgressChange,
            icon: Clock,
            color: "bg-orange-500",
        },
        {
            title: "Completed",
            value: stats.completed.toString(),
            change: stats.completedChange,
            icon: CheckSquare,
            color: "bg-green-500",
        },
        {
            title: "Overdue",
            value: stats.overdue.toString(),
            change: stats.overdueChange,
            icon: AlertCircle,
            color: "bg-red-500",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Title with Date Range Filter */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-2">Welcome back! Here&apos;s your task overview.</p>
                </div>

                {/* Date Range Filter */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                    <ExportButton stats={stats} tasks={recentTasks} />
                    <button
                        onClick={() => setDateRange("7d")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            dateRange === "7d" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}>
                        7 Days
                    </button>
                    <button
                        onClick={() => setDateRange("30d")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            dateRange === "30d" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}>
                        30 Days
                    </button>
                    <button
                        onClick={() => setDateRange("90d")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            dateRange === "90d" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        }`}>
                        90 Days
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsData.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Tasks by Status Chart */}
                <TasksChart
                    title="Tasks by Status"
                    data={tasksByStatus as { status: string; count: number }[]}
                    dataKey="count"
                    nameKey="status"
                />
                <TasksChart
                    title="Tasks by Priority"
                    data={tasksByPriority as { priority: string; count: number }[]}
                    dataKey="count"
                    nameKey="priority"
                />

                <TaskTrendsChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentTasksList tasks={recentTasks} />
                </div>

                <div>
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}
