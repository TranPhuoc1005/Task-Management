import { BaseApiResponse } from "@/interface/base.interface";
import { User } from "@/interface/user.interface";
import api from "./api";

export const listUsersApi = async (): Promise<User[]> => {
    try {
        const response = await api.get<BaseApiResponse<User[]>>("/api/users");
        return response.data;
    } catch (error) {
        console.error("🌲 ~ listUsersApi ~ error:", error);
        throw error;
    }
};

export const detailUserApi = async (id: string): Promise<User> => {
    try {
        const response = await api.get<BaseApiResponse<User>>(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error("🌲 ~ detailUserApi ~ error:", error);
        throw error;
    }
};

export const createUserApi = async (data: Partial<User>): Promise<User> => {
    try {
        const response = await api.post<BaseApiResponse<User>>("/api/create-user", data);
        return response.data;
    } catch (error) {
        console.error("🌲 ~ createUserApi ~ error:", error);
        throw error;
    }
};

export const updateUserRoleApi = async (userId: string, role: string): Promise<User> => {
    try {
        const response = await api.patch<BaseApiResponse<User>>("/api/users/role", { userId, role });
        return response.data;
    } catch (error) {
        console.error("🌲 ~ updateUserRoleApi ~ error:", error);
        throw error;
    }
};

export const removeUserApi = async (id: string): Promise<void> => {
    try {
        await api.delete(`/api/users?id=${id}`);
    } catch (error) {
        console.error("🌲 ~ removeUserApi ~ error:", error);
        throw error;
    }
};