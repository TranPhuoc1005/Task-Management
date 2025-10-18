"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { useTasks } from "@/hook/useTasks";
import TaskModal from "./TaskModal";
import {
    Calendar,
    User,
    Tag,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, task: Task) => void;
}

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
    const { deleteTask } = useTasks();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const priorityColors = {
        low: "bg-blue-100 text-blue-700",
        medium: "bg-yellow-100 text-yellow-700",
        high: "bg-red-100 text-red-700",
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTask.mutateAsync(task.id);
        }
    };

    return (
        <>
            <div
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-move group"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-slate-900 flex-1 pr-2">
                        {task.title}
                    </h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setIsEditModalOpen(true)}
                                className="cursor-pointer"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="cursor-pointer text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {task.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                            >
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        {task.assignee && (
                            <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignee}</span>
                            </div>
                        )}
                        {task.due_date && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{task.due_date}</span>
                            </div>
                        )}
                    </div>

                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priorityColors[task.priority]
                        }`}
                    >
                        {task.priority}
                    </span>
                </div>
            </div>

            {/* Edit Task Modal */}
            <TaskModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                task={task}
            />
        </>
    );
}
