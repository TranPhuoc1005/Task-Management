"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getProfileApi } from "@/services/profile.api";

const supabase = createClient();

export function useAuth() {
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
        queryFn: getProfileApi,
    });

    const currentUser = user ? {
        ...user,
        profile: profileQuery.data
    } : null;

    return {
        user,
        profile: profileQuery.data,
        profileQuery,
        currentUser,
        isLoading: profileQuery.isLoading,
        isAuthenticated: !!user,
    };
}