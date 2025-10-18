import StatsCard from "@/components/dashboard/StatsCard";
import { CheckSquare, Calendar, Users, Filter } from "lucide-react";

export default function HomePage() {
    const stats = [
        {
            title: "Total Tasks",
            value: "48",
            change: 12,
            icon: CheckSquare,
            color: "bg-blue-500",
        },
        {
            title: "In Progress",
            value: "18",
            change: 8,
            icon: Calendar,
            color: "bg-orange-500",
        },
        {
            title: "Completed",
            value: "24",
            change: 15,
            icon: CheckSquare,
            color: "bg-green-500",
        },
        {
            title: "Team Members",
            value: "12",
            change: 5,
            icon: Users,
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-2">
                    Welcome back! Here&apos;s your task overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Actions & Recent Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Recent Tasks
                        </h2>
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filter</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-lg cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-300"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900">
                                        Task title {item}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Due in 2 days
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    In Progress
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">
                        Activity
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex items-start space-x-3"
                            >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-900">
                                        Task completed
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        2 hours ago
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
