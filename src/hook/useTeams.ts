"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Team {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    created_at: string;
    updated_at: string;
    member_count?: number;
}

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department: string;
}

interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: 'team_lead' | 'member';
    joined_at: string;
    profile?: Profile;
}

interface TeamWithMembers extends Team {
    members: TeamMember[];
}

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'admin' | 'manager' | 'employee';
    department: string | null;
    primary_team_id: string | null;
}

export function useTeams() {
    const queryClient = useQueryClient();
    const [currentUser, setCurrentUser] = useState<{ id: string; profile: UserProfile } | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Get current user
    useEffect(() => {
        async function getCurrentUser() {
            console.log('🔍 Fetching current user...');
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            console.log('Auth user:', user);
            console.log('Auth error:', authError);

            if (user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                console.log('Profile data:', profile);
                console.log('Profile error:', profileError);

                if (profile) {
                    const userData = {
                        id: user.id,
                        profile: profile as UserProfile
                    };
                    console.log('✅ Setting currentUser:', userData);
                    setCurrentUser(userData);
                }
            }

            setIsAuthChecking(false);
        }
        getCurrentUser();
    }, []);

    // Fetch all teams
    const teamsQuery = useQuery<Team[]>({
        queryKey: ["teams"],
        queryFn: async () => {
            const { data, error } = await supabase.from("teams").select("*");
            if (error) throw error;
            return data ?? [];
        },
    });

    // Fetch team with members detail
    const useTeamWithMembers = (teamId?: string) => {
        return useQuery({
            queryKey: ["team-members", teamId],
            queryFn: async () => {
                if (!teamId) return null;

                // Get team info
                const { data: team, error: teamError } = await supabase
                    .from("teams")
                    .select("*")
                    .eq("id", teamId)
                    .single();

                if (teamError) throw teamError;

                // Get members with profiles
                const { data: memberships, error: membersError } = await supabase
                    .from("team_members")
                    .select("*")
                    .eq("team_id", teamId)
                    .order("role", { ascending: false });

                if (membersError) throw membersError;

                // Fetch profiles separately
                const userIds = memberships?.map(m => m.user_id) || [];
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("*")
                    .in("id", userIds);

                // Combine data
                const members = memberships?.map(membership => ({
                    ...membership,
                    profile: profiles?.find(p => p.id === membership.user_id)
                })) || [];

                return {
                    ...team,
                    members: members
                } as TeamWithMembers;
            },
            enabled: !!teamId && !!currentUser,
        });
    };

    // Fetch members grouped by team
    const teamMembersQuery = useQuery({
        queryKey: ["all-team-members"],
        queryFn: async () => {
            console.log('🚀 teamMembersQuery RUNNING');

            // Get all team memberships
            const { data: memberships, error: membershipsError } = await supabase
                .from("team_members")
                .select("*")
                .order("team_id", { ascending: true });

            if (membershipsError) {
                console.error('❌ Error fetching team members:', membershipsError);
                throw membershipsError;
            }

            console.log('📋 Raw memberships:', memberships);

            if (!memberships || memberships.length === 0) {
                console.log('⚠️ No memberships found');
                return [];
            }

            // Get all user IDs
            const userIds = memberships.map(m => m.user_id);
            console.log('👥 User IDs:', userIds);

            // Fetch all profiles
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("id, email, full_name, role, department")
                .in("id", userIds);

            if (profilesError) {
                console.error('❌ Error fetching profiles:', profilesError);
                throw profilesError;
            }

            console.log('👤 Profiles:', profiles);

            // Combine memberships with profiles
            const result = memberships.map(membership => ({
                ...membership,
                profile: profiles?.find(p => p.id === membership.user_id) || null
            }));

            console.log('✅ Combined team members:', result);
            return result as TeamMember[];
        },
        enabled: !isAuthChecking, // Only run after auth check completes
        staleTime: 30000, // Cache for 30 seconds
    });

    // Add member to team
    const addTeamMember = useMutation({
        mutationFn: async ({ teamId, userId, role = 'member' }: {
            teamId: string;
            userId: string;
            role?: 'team_lead' | 'member'
        }) => {
            if (!currentUser) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from("team_members")
                .insert([{
                    team_id: teamId,
                    user_id: userId,
                    role: role
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            queryClient.invalidateQueries({ queryKey: ["all-team-members"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    // Remove member from team
    const removeTeamMember = useMutation({
        mutationFn: async (membershipId: string) => {
            const { error } = await supabase
                .from("team_members")
                .delete()
                .eq("id", membershipId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            queryClient.invalidateQueries({ queryKey: ["all-team-members"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    // Update member role
    const updateMemberRole = useMutation({
        mutationFn: async ({ membershipId, role }: {
            membershipId: string;
            role: 'team_lead' | 'member'
        }) => {
            const { data, error } = await supabase
                .from("team_members")
                .update({ role })
                .eq("id", membershipId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            queryClient.invalidateQueries({ queryKey: ["all-team-members"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    // Permissions
    const canManageTeams = currentUser?.profile?.role === 'admin';

    return {
        teamsQuery,
        useTeamWithMembers,
        teamMembersQuery,
        addTeamMember,
        removeTeamMember,
        updateMemberRole,
        currentUser,
        canManageTeams,
        isAuthChecking,
    };
}