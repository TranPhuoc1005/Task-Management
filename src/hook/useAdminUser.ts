"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import {
    listUsersApi,
    updateUserRoleApi,
    removeUserApi,
} from "@/services/user.api";
import {
    listTeamsApi,
    listTeamMembersApi,
    assignTeamMemberApi,
    updateTeamMemberRoleApi,
    removeTeamMemberApi,
} from "@/services/team.api";

export function useAdminUsers() {
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: listUsersApi,
        enabled: !!currentUser,
    });

    const teamsQuery = useQuery({
        queryKey: ["teams"],
        queryFn: listTeamsApi,
        enabled: !!currentUser,
    });

    const teamMembersQuery = useQuery({
        queryKey: ["team-members"],
        queryFn: listTeamMembersApi,
        enabled: !!currentUser,
    });

    const updateRole = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) =>
            updateUserRoleApi(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const removeUser = useMutation({
        mutationFn: removeUserApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    const assignTeam = useMutation({
        mutationFn: ({ userId, teamId, role = "member" }: {
            userId: string;
            teamId: string;
            role?: "team_lead" | "member"
        }) => assignTeamMemberApi(userId, teamId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    const removeTeam = useMutation({
        mutationFn: removeTeamMemberApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    const updateMemberRole = useMutation({
        mutationFn: ({ membershipId, role }: { membershipId: string; role: "team_lead" | "member" }) =>
            updateTeamMemberRoleApi(membershipId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
    });

    return {
        users: usersQuery.data || [],
        teams: teamsQuery.data || [],
        teamMembers: teamMembersQuery.data || [],
        isLoading: usersQuery.isLoading || teamsQuery.isLoading || teamMembersQuery.isLoading,
        currentUser,
        updateRole,
        removeUser,
        assignTeam,
        removeTeam,
        updateMemberRole,
    };
}