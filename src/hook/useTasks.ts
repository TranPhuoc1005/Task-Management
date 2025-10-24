"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types/task";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

const supabase = createClient();

export function useTasks() {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const profileQuery = useQuery({
        queryKey: ["profile", user?.id],
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            return data;
        },
    });

    // ✅ Chỉ fetch tasks khi có user VÀ profile đã load xong
    const tasksQuery = useQuery({
        queryKey: ["tasks", user?.id, profileQuery.data?.role],
        enabled: !!user && profileQuery.isSuccess, // Đợi profile load xong
        queryFn: async () => {
            if (!user) return [];

            const role = profileQuery.data?.role;

            // Nếu là admin hoặc manager, lấy tất cả tasks
            if (role === "admin" || role === "manager") {
                const { data, error } = await supabase
                    .from("tasks")
                    .select(`*, profiles:user_id (id,email,full_name,department)`)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                return data as Task[];
            }

            // Nếu là employee, chỉ lấy tasks của chính mình
            const { data, error } = await supabase
                .from("tasks")
                .select(`*, profiles:user_id (id,email,full_name,department)`)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
    });

    const addTask = useMutation({
        mutationFn: async (newTask: Omit<Task, "id" | "created_at" | "updated_at">) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from("tasks")
                .insert([{ ...newTask, created_by: user?.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const updateTask = useMutation({
        mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
            const { data, error } = await supabase
                .from("tasks")
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const moveTask = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: Task["status"] }) => {
            const { data, error } = await supabase
                .from("tasks")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from("tasks").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const currentUser = user ? { ...user, profile: profileQuery.data } : null;

    return {
        tasksQuery,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        currentUser,
    };
}