"use client";

import { useTeams } from "@/hook/useTeams";
import { Users, Mail, Phone, MapPin, Shield, Crown } from "lucide-react";

export default function TeamPage() {
    const { teamsQuery, teamMembersQuery, currentUser } = useTeams();

    if (teamsQuery.isLoading || teamMembersQuery.isLoading) {
        return <p className="p-6">Loading teams...</p>;
    }

    if (teamsQuery.error) {
        return <p className="p-6 text-red-500">Error: {teamsQuery.error.message}</p>;
    }

    const teams = teamsQuery.data || [];
    const allMembers = teamMembersQuery.data || [];

    // Group members by team
    const membersByTeam = allMembers.reduce((acc, member) => {
        const teamId = member.team_id;
        if (!acc[teamId]) acc[teamId] = [];
        acc[teamId].push(member);
        return acc;
    }, {} as Record<string, typeof allMembers>);

    // Calculate stats
    const totalMembers = allMembers.length;
    const totalTeams = teams.length;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Team Members</h1>
                        <p className="text-slate-600 mt-2">Manage your teams and track their progress</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {currentUser?.profile?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Teams</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{totalTeams}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Members</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{totalMembers}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Avg Team Size</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">
                                {totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Teams Grid */}
            {teams.map((team) => {
                const teamMembers = membersByTeam[team.id] || [];
                const teamLead = teamMembers.find((m) => m.role === "team_lead");

                return (
                    <div key={team.id} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                        {/* Team Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: team.color }}>
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{team.name}</h2>
                                    <p className="text-sm text-slate-600">{team.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                                    {teamMembers.length} members
                                </span>
                            </div>
                        </div>

                        {/* Team Members Grid */}
                        {teamMembers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {teamMembers.map((membership) => {
                                    const member = membership.profile;
                                    if (!member) return null;

                                    const initials =
                                        member.full_name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) || "NA";

                                    const isTeamLead = membership.role === "team_lead";

                                    return (
                                        <div
                                            key={membership.id}
                                            className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all">
                                            {/* Avatar */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                                    style={{ backgroundColor: team.color }}>
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {member.full_name || "Unknown"}
                                                        </h3>
                                                        {isTeamLead && (
                                                            <div title="Team Lead">
                                                                <Crown className="w-4 h-4 text-yellow-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600 capitalize">{member.role}</p>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                                {member.department && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{member.department}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Role Badge */}
                                            {isTeamLead && (
                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                        <Shield className="w-3 h-3" />
                                                        Team Lead
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No members in this team yet</p>
                            </div>
                        )}
                    </div>
                );
            })}

            {teams.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No teams found</p>
                </div>
            )}
        </div>
    );
}
