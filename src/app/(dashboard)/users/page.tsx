"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, X, Crown, UserCog, User } from "lucide-react";
import Image from "next/image";
import { useAdminUsers } from "@/hook/useAdminUser";

interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
    created_at: string;
}

export default function AdminUsersPage() {
    const { users, teams, teamMembers, isLoading, currentUser, updateRole, removeUser, assignTeam, removeTeam, updateMemberRole } = useAdminUsers();
    
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
        role: "employee",
        department: "",
    });

    const currentUserRole = currentUser?.profile?.role;
    const currentUserId = currentUser?.id;

    async function handleCreateUser() {
        try {
            const res = await fetch("/api/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok) {
                alert("✅ User created successfully!");
                setShowAddForm(false);
                setFormData({ email: "", password: "", full_name: "", role: "employee", department: "" });
            } else {
                alert(`❌ Error: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            alert("❌ Failed to create user");
            console.log(error)
        }
    }

    const getUserTeams = (userId: string) => teamMembers.filter((m) => m.user_id === userId);

    const getInitials = (name: string | null, email: string) => {
        if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
        return email.charAt(0).toUpperCase();
    };

    const adminUsers = users.filter((u) => u.role === "admin");
    const managerUsers = users.filter((u) => u.role === "manager");
    const employeeUsers = users.filter((u) => u.role === "employee");

    const roleConfig = {
        admin: {
            label: "Admins",
            icon: Crown,
            color: "from-red-500 to-pink-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            textColor: "text-red-700",
            count: adminUsers.length,
        },
        manager: {
            label: "Managers",
            icon: UserCog,
            color: "from-blue-500 to-indigo-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            count: managerUsers.length,
        },
        employee: {
            label: "Employees",
            icon: User,
            color: "from-gray-500 to-slate-500",
            bgColor: "bg-slate-50",
            borderColor: "border-slate-200",
            textColor: "text-slate-700",
            count: employeeUsers.length,
        },
    };

    const UserCard = ({ user }: { user: User }) => {
        const isCurrentUser = currentUserId === user.id;
        const userTeams = getUserTeams(user.id);
        const canManage = (currentUserRole === "admin" || currentUserRole === "manager") && !isCurrentUser;
        const config = roleConfig[user.role as keyof typeof roleConfig];

        return (
            <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                            <Image
                                src={user.avatar_url}
                                alt={user.full_name || user.email}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold`}>
                                {getInitials(user.full_name, user.email)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">{user.full_name || "No Name"}</h3>
                                <p className="text-sm text-slate-600 truncate">{user.email}</p>
                            </div>

                            <div className="flex items-center gap-1">
                                <select
                                    value={user.role}
                                    onChange={(e) => {
                                        if (isCurrentUser) {
                                            alert("❌ You cannot change your own role!");
                                            return;
                                        }
                                        updateRole.mutate({ userId: user.id, role: e.target.value });
                                    }}
                                    disabled={isCurrentUser}
                                    className="text-sm px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {currentUserRole === "manager" && user.role === "employee" && !isCurrentUser && (
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this user?")) {
                                                removeUser.mutate(user.id);
                                            }
                                        }}
                                        className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="truncate">{user.department || "No dept"}</span>
                            <span>•</span>
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>

                        {canManage && (
                            <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Teams {userTeams.length > 0 && `(${userTeams.length})`}
                                    </span>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const existing = userTeams.find((m) => m.team_id === e.target.value);
                                                if (existing) {
                                                    alert("❌ User is already in this team!");
                                                    return;
                                                }
                                                assignTeam.mutate({ userId: user.id, teamId: e.target.value });
                                                e.target.value = "";
                                            }
                                        }}
                                        className="text-sm px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white hover:bg-slate-50"
                                        defaultValue="">
                                        <option value="" disabled>+ Add Team</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {userTeams.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {userTeams.map((membership) => {
                                            const team = membership.team;
                                            if (!team) return null;

                                            return (
                                                <div
                                                    key={membership.id}
                                                    className="flex items-center gap-2 p-2 rounded-md border"
                                                    style={{
                                                        backgroundColor: `${team.color}15`,
                                                        borderColor: `${team.color}40`,
                                                    }}>
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                                                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">{team.name}</span>
                                                    <select
                                                        value={membership.role}
                                                        onChange={(e) =>
                                                            updateMemberRole.mutate({
                                                                membershipId: membership.id,
                                                                role: e.target.value as "team_lead" | "member",
                                                            })
                                                        }
                                                        className="text-sm p-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                                        <option value="member">Member</option>
                                                        <option value="team_lead">Lead</option>
                                                    </select>
                                                    <button
                                                        onClick={() => removeTeam.mutate(membership.id)}
                                                        className="hover:bg-slate-200 rounded p-0.5 transition-colors">
                                                        <X className="w-3.5 h-3.5 text-slate-600" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded">
                                        No teams assigned
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-600 mt-1">{users.length} total users</p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
                    {showAddForm ? "Cancel" : "+ Add User"}
                </Button>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
                    <h2 className="font-semibold mb-3">Create New User</h2>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-sm">Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Password *</Label>
                                <Input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-9 text-sm"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Full Name *</Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Role</Label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm">
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-sm">Department</Label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="h-9 text-sm"
                                    placeholder="Engineering, Sales, etc."
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreateUser} className="w-full h-9" size="sm">
                            Create User
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {[
                    { users: managerUsers, config: roleConfig.manager },
                    { users: adminUsers, config: roleConfig.admin },
                    { users: employeeUsers, config: roleConfig.employee },
                ].map(({ users: roleUsers, config }) => (
                    <div key={config.label}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                <config.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{config.label}</h2>
                                <p className="text-xs text-slate-600">{config.count} users</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {roleUsers.map((user) => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                        {roleUsers.length === 0 && (
                            <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-6 text-center`}>
                                <p className={`text-sm ${config.textColor}`}>No {config.label.toLowerCase()} yet</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}