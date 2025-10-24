"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Shield, Trash2 } from "lucide-react";

interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    created_at: string;
}

export default function AdminUsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
        role: "employee",
        department: "",
    });

    const checkAccess = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (profile) {
                setCurrentUserRole(profile.role);
                if (profile.role !== "admin" && profile.role !== "manager") {
                    window.location.href = "/";
                }
            }
        }
    }, [supabase]);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (error) {
            console.error("Error fetching users:", error);
            alert(`❌ Error loading users: ${error.message}`);
        } else if (data) {
            setUsers(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        checkAccess();
        fetchUsers();
    }, [checkAccess, fetchUsers]);

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();

        try {
            const response = await fetch("/api/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ User created successfully!");
                setShowAddForm(false);
                fetchUsers();
                setFormData({
                    email: "",
                    password: "",
                    full_name: "",
                    role: "employee",
                    department: "",
                });
            } else {
                alert(`❌ Error: ${result.error || "Unknown error"}`);
            }
        } catch (error: unknown) {
            console.error("Create user error:", error);
            alert("❌ Failed to create user:Unknown error");
        }
    }

    async function updateUserRole(userId: string, newRole: string) {
        try {
            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            // Prevent users from changing their own role
            if (user?.id === userId) {
                alert("❌ You cannot change your own role!");
                fetchUsers(); // Refresh to reset the dropdown
                return;
            }

            const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

            if (error) {
                console.error("Update role error:", error);
                alert(`❌ Failed to update role: ${error.message}`);
                fetchUsers(); // Refresh to reset the dropdown
            } else {
                alert("✅ Role updated successfully!");
                fetchUsers();
            }
        } catch (error: unknown) {
            console.error("Create user error:", error);
            alert("❌ Failed to create user:Unknown error");
            fetchUsers();
        }
    }

    async function deleteUser(userId: string) {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            // Prevent users from deleting themselves
            if (user?.id === userId) {
                alert("❌ You cannot delete your own account!");
                return;
            }

            // Only admin can delete users
            if (currentUserRole !== "admin") {
                alert("❌ Only admins can delete users!");
                return;
            }

            const { error } = await supabase.from("profiles").delete().eq("id", userId);

            if (error) {
                console.error("Delete user error:", error);
                alert(`❌ Failed to delete user: ${error.message}`);
            } else {
                alert("✅ User deleted successfully!");
                fetchUsers();
            }
        } catch (error: unknown) {
            console.error("Create user error:", error);
            alert("❌ Failed to create user:Unknown error");
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-700 border-red-200";
            case "manager":
                return "bg-blue-100 text-blue-700 border-blue-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-600 mt-2">{users.length} total users</p>
                    {currentUserRole && (
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-2 ${getRoleBadgeColor(
                                currentUserRole
                            )}`}>
                            <Shield className="w-3 h-3 mr-1" />
                            Your role: {currentUserRole.toUpperCase()}
                        </span>
                    )}
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Cancel" : "+ Add User"}</Button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <div className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Create New User</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Password *</Label>
                                <Input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <div>
                                <Label>Full Name *</Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Role</Label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Label>Department</Label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g., Engineering, Sales, Marketing"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            Create User
                        </Button>
                    </form>
                </div>
            )}

            {/* Users Table */}
            {/* Users Table / Cards */}
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.map((user) => {
                                const isCurrentUser = currentUserId === user.id;
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 break-words">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{user.full_name || "-"}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                disabled={isCurrentUser}
                                                className="px-2 py-1 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize">
                                                <option value="employee">Employee</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{user.department || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {currentUserRole === "admin" && (
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden divide-y divide-slate-200">
                    {users.map((user) => {
                        const isCurrentUser = currentUserId === user.id;
                        return (
                            <div key={user.id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-slate-900 text-sm break-words">
                                        {user.full_name || "-"}
                                    </p>
                                    {currentUserRole === "admin" && (
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-600 text-xs break-words">{user.email}</p>

                                <div className="mt-2 flex flex-col gap-1">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Role:</span>
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                            disabled={isCurrentUser}
                                            className="border border-slate-300 rounded-md px-2 py-0.5 text-xs">
                                            <option value="employee">Employee</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Department:</span>
                                        <span className="font-medium">{user.department || "-"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Created:</span>
                                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {users.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-500">No users found</p>
                </div>
            )}
        </div>
    );
}
