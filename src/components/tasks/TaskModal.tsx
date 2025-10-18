"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { useTasks } from "@/hook/useTasks";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task; // Nếu có task thì là edit, không có thì là create
    defaultStatus?: Task["status"];
}

export default function TaskModal({
    open,
    onOpenChange,
    task,
    defaultStatus = "todo",
}: TaskModalProps) {
    const { addTask, updateTask } = useTasks();
    const isEdit = !!task;

    const [formData, setFormData] = useState({
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || defaultStatus,
        priority: task?.priority || "medium",
        assignee: task?.assignee || "",
        dueDate: task?.due_date || "",
        tags: task?.tags?.join(", ") || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status as Task["status"],
                priority: formData.priority as Task["priority"],
                assignee: formData.assignee || undefined,
                due_date: formData.dueDate || undefined,
                tags: formData.tags
                    ? formData.tags.split(",").map((t) => t.trim())
                    : [],
            };

            if (isEdit && task) {
                await updateTask.mutateAsync({
                    id: task.id,
                    updates: taskData,
                });
            } else {
                await addTask.mutateAsync(taskData);
            }

            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            status: defaultStatus,
            priority: "medium",
            assignee: "",
            dueDate: "",
            tags: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the task details below"
                            : "Fill in the details to create a new task"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Enter task description"
                            rows={3}
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        status: value as Task["status"],
                                    })
                                }
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        priority: value as Task["priority"],
                                    })
                                }
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Assignee & Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assignee">Assignee</Label>
                            <Input
                                id="assignee"
                                value={formData.assignee}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        assignee: e.target.value,
                                    })
                                }
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dueDate: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData({ ...formData, tags: e.target.value })
                            }
                            placeholder="design, ui/ux, backend (comma separated)"
                        />
                    </div>F

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Saving..."
                                : isEdit
                                ? "Update Task"
                                : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}