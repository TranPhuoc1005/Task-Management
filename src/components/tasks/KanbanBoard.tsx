"use client";

import { useState } from "react";
import { Column, Task } from "@/types/task";
import KanbanColumn from "./KanbanColumn";
import { useTasks } from "@/hook/useTasks";

export default function KanbanBoard() {
    const { tasksQuery, moveTask } = useTasks();
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    if (tasksQuery.isLoading) return <p className="p-6">Loading tasks...</p>;
    if (tasksQuery.error)
        return (
            <p className="p-6 text-red-500">
                Error: {tasksQuery.error.message}
            </p>
        );

    const tasks = tasksQuery.data || [];

    const columns: Column[] = [
        {
            id: "todo",
            title: "To Do",
            status: "todo",
            tasks: tasks.filter((t) => t.status === "todo"),
        },
        {
            id: "in-progress",
            title: "In Progress",
            status: "in-progress",
            tasks: tasks.filter((t) => t.status === "in-progress"),
        },
        {
            id: "review",
            title: "Review",
            status: "review",
            tasks: tasks.filter((t) => t.status === "review"),
        },
        {
            id: "done",
            title: "Done",
            status: "done",
            tasks: tasks.filter((t) => t.status === "done"),
        },
    ];

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, toStatus: Task["status"]) => {
        e.preventDefault();
        if (!draggedTask || draggedTask.status === toStatus) return;

        moveTask.mutate({ id: draggedTask.id, status: toStatus });
        setDraggedTask(null);
    };

    return (
        <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="flex gap-6 p-6 h-full">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                ))}
            </div>
        </div>
    );
}
