"use client"

import KanbanBoard from "@/components/tasks/KanbanBoard";
import { useTasks } from "@/hook/useTasks";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function TasksPage() {
    const { tasksQuery } = useTasks();
    if(tasksQuery.isLoading) return <p className="p-6">Loading tasks...</p>
    if(tasksQuery.error) {
        return (
            <p className="p-6 text-red-500">
                Error: {tasksQuery.error.message}
            </p>
        )
    }
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Tasks Board
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Manage your tasks with drag and drop
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="text-sm font-medium">View</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard />
            </div>
        </div>
    );
}
