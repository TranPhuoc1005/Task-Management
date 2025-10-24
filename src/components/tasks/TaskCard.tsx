"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import TaskModal from "./TaskModal";
import { Calendar, Tag, AlertCircle, UserX } from "lucide-react";
import { useTasks } from "@/hook/useTasks";

interface TaskCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, task: Task) => void;
}

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUser } = useTasks();

    const priorityColors: Record<Task["priority"], string> = {
        low: "bg-green-100 text-green-700 border-green-200",
        medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
        high: "bg-red-100 text-red-700 border-red-200",
    };

    // Kiểm tra task chưa được assign
    const isUnassigned = !task.user_id;

    // Kiểm tra user có phải admin/manager không
    const isAdminOrManager = currentUser?.profile?.role === "admin" || currentUser?.profile?.role === "manager";

    // Hiển thị warning cho admin/manager nếu task chưa assign
    const showUnassignedWarning = isUnassigned && isAdminOrManager;

    return (
        <>
            <div
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                onClick={() => setIsModalOpen(true)}
                className={`
                    bg-white rounded-lg p-4 shadow-sm border cursor-pointer
                    hover:shadow-md transition-all
                    ${
                        showUnassignedWarning
                            ? "border-orange-300 ring-2 ring-orange-100 bg-orange-50"
                            : "border-slate-200 hover:border-slate-300"
                    }
                `}>
                {/* Unassigned Warning Badge - chỉ hiện cho admin/manager */}
                {showUnassignedWarning && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-orange-100 border border-orange-200 rounded-md">
                        <UserX className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">Not assigned yet</span>
                    </div>
                )}

                {/* Title */}
                <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">{task.title}</h3>

                {/* Description */}
                {task.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {/* Priority Badge */}
                    <span
                        className={`
                            px-2 py-1 text-xs font-medium rounded-full border
                            ${priorityColors[task.priority]}
                        `}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>

                    {/* Due Date */}
                    {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                                {new Date(task.due_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Assignee Info */}
                {task.profiles && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                {task.profiles.full_name?.[0]?.toUpperCase() || task.profiles.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700 truncate">
                                    {task.profiles.full_name || task.profiles.email}
                                </p>
                                {task.profiles.department && (
                                    <p className="text-xs text-slate-500 truncate">{task.profiles.department}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Unassigned placeholder cho admin/manager */}
                {isUnassigned && isAdminOrManager && (
                    <div className="mt-3 pt-3 border-t border-orange-100">
                        <div className="flex items-center gap-2 text-orange-600">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium">Click to assign user</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Task Modal */}
            <TaskModal open={isModalOpen} onOpenChange={setIsModalOpen} task={task} />
        </>
    );
}
