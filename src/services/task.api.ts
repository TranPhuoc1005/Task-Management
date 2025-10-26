import { BaseApiResponse } from "@/interface/base.interface";
import type { Task } from "@/types/task";
import api from "./api";

export const listTasksApi = async (): Promise<Task[]> => {
    try {
        const response = await api.get<BaseApiResponse<Task[]>>("/api/tasks");
        return response.data;
    } catch (error) {
        console.error("🌲 ~ listTasksApi ~ error:", error);
        throw error;
    }
};

export const createTaskApi = async (data: Partial<Task>): Promise<Task> => {
    try {
        const response = await api.post<BaseApiResponse<Task>>("/api/tasks", data);
        return response.data;
    } catch (error) {
        console.error("🌲 ~ createTaskApi ~ error:", error);
        throw error;
    }
};

export const updateTaskApi = async (id: number, updates: Partial<Task>): Promise<Task> => {
    try {
        const response = await api.put<BaseApiResponse<Task>>("/api/tasks", { id, ...updates });
        return response.data;
    } catch (error) {
        console.error("🌲 ~ updateTaskApi ~ error:", error);
        throw error;
    }
};

export const moveTaskApi = async (id: number, status: Task["status"]): Promise<Task> => {
    try {
        const response = await api.patch<BaseApiResponse<Task>>("/api/tasks/move", { id, status });
        return response.data;
    } catch (error) {
        console.error("🌲 ~ moveTaskApi ~ error:", error);
        throw error;
    }
};

export const removeTaskApi = async (id: number): Promise<void> => {
    try {
        await api.delete(`/api/tasks?id=${id}`);
    } catch (error) {
        console.error("🌲 ~ removeTaskApi ~ error:", error);
        throw error;
    }
};