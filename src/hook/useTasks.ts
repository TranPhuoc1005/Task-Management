"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Task } from "@/types/task";

export function useTasks() {
    const queryClient = useQueryClient();

    // Fetch all tasks
    const tasksQuery = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
    });

    // Add task mutation
    const addTask = useMutation({
        mutationFn: async (newTask: Omit<Task, "id" | "created_at" | "updated_at">) => {
            const { data, error } = await supabase
                .from("tasks")
                .insert([newTask])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // Refresh notifications
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    // Update task mutation
    const updateTask = useMutation({
        mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
            const { data, error } = await supabase
                .from("tasks")
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(), // Force update timestamp
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // Refresh notifications
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            // Force refetch ngay lập tức
            queryClient.refetchQueries({
                queryKey: ["notifications", "recent-activities"],
                type: 'active'
            });
        },
    });

    // Move task (drag & drop)
    const moveTask = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: Task["status"] }) => {
            console.log('🎯 Moving task:', id, 'to status:', status);

            const { data, error } = await supabase
                .from("tasks")
                .update({
                    status,
                    updated_at: new Date().toISOString() // QUAN TRỌNG: Force update timestamp
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Task moved successfully:', data);
            return data;
        },
        onSuccess: (data) => {
            console.log('🔄 Refreshing queries...');

            // Refresh tasks list
            queryClient.invalidateQueries({ queryKey: ["tasks"] });

            // Refresh notifications - QUAN TRỌNG
            queryClient.invalidateQueries({ queryKey: ["notifications", "due-soon"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "recent-activities"] });

            // Force refetch ngay lập tức
            queryClient.refetchQueries({
                queryKey: ["notifications", "recent-activities"],
                type: 'active'
            });

            console.log('✅ All queries refreshed');
        },
        onError: (error) => {
            console.error('❌ Error moving task:', error);
        },
    });

    // Delete task mutation
    const deleteTask = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // Refresh notifications
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    return {
        tasksQuery,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
    };
}