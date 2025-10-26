"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.api";

export function useNotifications() {
    const {
        data,
        error,
        isLoading,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        refetchInterval: 30 * 1000, // refetch mỗi 30 giây
    });

    const dueSoonTasks = data?.dueSoonTasks || [];
    const recentActivities = data?.recentActivities || [];
    const totalNotifications = data?.totalNotifications || 0;

    return {
        dueSoonTasks,
        recentActivities,
        totalNotifications,
        isLoading,
        isFetching,
        error,
        refetch,
    };
}
