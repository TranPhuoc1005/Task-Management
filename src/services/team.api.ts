import { Team, TeamMember } from "@/interface/team.interface";
import api from "./api";
import { BaseApiResponse } from "@/interface/base.interface";

export const listTeamsApi = async (): Promise<Team[]> => {
    try {
        const response = await api.get<BaseApiResponse<Team[]>>("/api/teams");
        return response.data;
    } catch (error) {
        console.error("🌲 ~ listTeamsApi ~ error:", error);
        throw error;
    }
};

export const createTeamApi = async (data: Partial<Team>): Promise<Team> => {
    try {
        const response = await api.post<BaseApiResponse<Team>>("/api/teams", data);
        return response.data;
    } catch (error) {
        console.error("🌲 ~ createTeamApi ~ error:", error);
        throw error;
    }
};

export const listTeamMembersApi = async (): Promise<TeamMember[]> => {
    try {
        const response = await api.get<BaseApiResponse<TeamMember[]>>("/api/team-members");
        return response.data;
    } catch (error) {
        console.error("🌲 ~ listTeamMembersApi ~ error:", error);
        throw error;
    }
};

export const assignTeamMemberApi = async (
    userId: string,
    teamId: string,
    role: "team_lead" | "member"
): Promise<TeamMember> => {
    try {
        const response = await api.post<BaseApiResponse<TeamMember>>("/api/team-members", {
            userId,
            teamId,
            role,
        });
        return response.data;
    } catch (error) {
        console.error("🌲 ~ assignTeamMemberApi ~ error:", error);
        throw error;
    }
};

export const updateTeamMemberRoleApi = async (
    membershipId: string,
    role: "team_lead" | "member"
): Promise<TeamMember> => {
    try {
        const response = await api.patch<BaseApiResponse<TeamMember>>("/api/team-members/role", {
            membershipId,
            role,
        });
        return response.data;
    } catch (error) {
        console.error("🌲 ~ updateTeamMemberRoleApi ~ error:", error);
        throw error;
    }
};

export const removeTeamMemberApi = async (membershipId: string): Promise<void> => {
    try {
        await api.delete(`/api/team-members?id=${membershipId}`);
    } catch (error) {
        console.error("🌲 ~ removeTeamMemberApi ~ error:", error);
        throw error;
    }
};