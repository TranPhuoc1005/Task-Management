"use client";

import { useState } from "react";
import { Column, Task } from "@/types/task";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import { Plus, MoreHorizontal } from "lucide-react";

interface KanbanColumnProps {
    column: Column;
    onDragStart: (e: React.DragEvent, task: Task) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: Task["status"]) => void;
}

export default function KanbanColumn({
    column,
    onDragStart,
    onDragOver,
    onDrop,
}: KanbanColumnProps) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
        onDragOver(e);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        setIsDraggingOver(false);
        onDrop(e, column.status);
    };

    return (
        <>
            <div
                className={`flex-shrink-0 w-80 bg-slate-50 rounded-lg p-4 ${
                    isDraggingOver ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                            {column.title}
                        </h2>
                        <span className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded-full">
                            {column.tasks.length}
                        </span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Tasks */}
                <div className="space-y-3 mb-3 min-h-[200px]">
                    {column.tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDragStart={onDragStart}
                        />
                    ))}
                </div>

                {/* Add Task Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Task</span>
                </button>
            </div>

            {/* Create Task Modal */}
            <TaskModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                defaultStatus={column.status}
            />
        </>
    );
}
