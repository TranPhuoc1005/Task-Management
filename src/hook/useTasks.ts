"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types/task";
import { useAuth } from "./useAuth";
import {
    listTasksApi,
    createTaskApi,
    updateTaskApi,
    moveTaskApi,
    removeTaskApi
} from "@/services/task.api";

export function useTasks() {
    const queryClient = useQueryClient();
    const { user, profile, profileQuery, currentUser } = useAuth();

    const tasksQuery = useQuery({
        queryKey: ["tasks", user?.id, profile?.role],
        enabled: !!user && profileQuery.isSuccess,
        queryFn: listTasksApi,
    });

    const addTask = useMutation({
        mutationFn: createTaskApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const updateTask = useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) =>
            updateTaskApi(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const moveTask = useMutation({
        mutationFn: ({ id, status }: { id: number; status: Task["status"] }) =>
            moveTaskApi(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const deleteTask = useMutation({
        mutationFn: removeTaskApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    return {
        tasksQuery,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        currentUser,
    };
}