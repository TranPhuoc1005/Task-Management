import { BaseApiResponse } from "@/interface/base.interface";
import { Profile } from "@/interface/profile.interface";
import api from "./api";

export const getProfileApi = async (): Promise<Profile> => {
    try {
        const response = await api.get<BaseApiResponse<Profile>>("/api/profile");
        return response.data;
    } catch (error) {
        console.error("🌲 ~ getProfileApi ~ error:", error);
        throw error;
    }
};

export const updateProfileApi = async (data: Partial<Profile>): Promise<Profile> => {
    try {
        const response = await api.put<BaseApiResponse<Profile>>("/api/profile", data);
        return response.data;
    } catch (error) {
        console.error("🌲 ~ updateProfileApi ~ error:", error);
        throw error;
    }
};

export const uploadAvatarApi = async (file: File): Promise<Profile> => {
    try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await api.post<BaseApiResponse<Profile>>("/api/profile/avatar", formData);
        return response.data;
    } catch (error) {
        console.error("🌲 ~ uploadAvatarApi ~ error:", error);
        throw error;
    }
};