"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { DashboardStats } from "@/hook/useDashboard";

interface ExportButtonProps {
    stats: DashboardStats;
    tasks: any[];
}

export default function ExportButton({ stats, tasks }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const exportToCSV = () => {
        const headers = ["Title", "Status", "Priority", "Assignee", "Due Date", "Created"];
        const rows = tasks.map((task) => [
            task.title,
            task.status,
            task.priority,
            task.assignee || "Unassigned",
            task.due_date || "No due date",
            new Date(task.created_at).toLocaleDateString(),
        ]);

        const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tasks-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportToJSON = () => {
        const data = {
            exportDate: new Date().toISOString(),
            stats: stats,
            tasks: tasks,
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                        <button
                            onClick={exportToCSV}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-slate-900">Export as CSV</span>
                        </button>
                        <button
                            onClick={exportToJSON}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-100">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-900">Export as JSON</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
