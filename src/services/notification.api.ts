import axios from "axios";
import { NotificationsResponse } from "@/types/notifications";


export const getNotifications = async (): Promise<NotificationsResponse> => {
    const response = await axios.get<NotificationsResponse>("/api/notifications");
    return response.data;
};
