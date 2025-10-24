"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Camera, Mail, Briefcase, Building2, Shield } from "lucide-react";
import Image from "next/image";

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        department: "",
    });

    const fetchProfile = useCallback(async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (!error && profileData) {
                    const fullProfile = { ...profileData, email: user.email || "" };
                    setProfile(fullProfile);
                    setFormData({
                        full_name: profileData.full_name || "",
                        department: profileData.department || "",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        full_name: formData.full_name,
                        department: formData.department,
                    })
                    .eq("id", user.id);

                if (error) throw error;

                alert("✅ Profile updated successfully!");
                fetchProfile();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("❌ Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("File size must be less than 2MB");
            return;
        }

        setUploading(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            if (profile?.avatar_url) {
                const oldPath = profile.avatar_url.split("/").slice(-2).join("/");
                await supabase.storage.from("avatars").remove([oldPath]);
            }

            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(fileName);

            console.log("Public URL:", publicUrl);

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", user.id);

            if (updateError) {
                console.error("Update error:", updateError);
                throw updateError;
            }

            alert("✅ Avatar updated successfully!");
            fetchProfile();
        } catch (error: unknown) {
            console.error("Error uploading avatar:", error);
            alert("❌ Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    }

    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

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
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 mt-2">Manage your personal information and preferences</p>
            </div>

            {/* Avatar Section */}
            <div className="bg-white rounded-xl border p-8 mb-6">
                <div className="flex flex-col justify-center items-center md:justify-start space-x-6 md:flex-row gap-5">
                    <div className="relative !mr-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} width={96} height={96} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {getInitials(profile?.full_name || null)}
                                </span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors">
                            <Camera className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 md:text-left text-center">{profile?.full_name || "No name set"}</h2>
                        <p className="text-slate-600">{profile?.email}</p>
                        <div className="mt-2 md:text-left text-center">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                    profile?.role || "employee"
                                )}`}>
                                <Shield className="w-3 h-3 mr-1" />
                                {profile?.role?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                {uploading && <div className="mt-4 text-sm text-blue-600">Uploading avatar...</div>}
            </div>

            {/* Profile Information Form */}
            <div className="bg-white rounded-xl border p-8">
                <h2 className="text-xl font-bold mb-6">Personal Information</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email (Read-only) */}
                    <div>
                        <Label className="flex items-center space-x-2 text-slate-700">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                        </Label>
                        <Input type="email" value={profile?.email || ""} disabled className="mt-2 bg-slate-50" />
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Full Name */}
                    <div>
                        <Label className="flex items-center space-x-2 text-slate-700">
                            <span>Full Name *</span>
                        </Label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="mt-2"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <Label className="flex items-center space-x-2 text-slate-700">
                            <Building2 className="w-4 h-4" />
                            <span>Department</span>
                        </Label>
                        <Input
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="mt-2"
                            placeholder="e.g., Engineering, Sales, Marketing"
                        />
                    </div>

                    {/* Role (Read-only) */}
                    <div>
                        <Label className="flex items-center space-x-2 text-slate-700">
                            <Briefcase className="w-4 h-4" />
                            <span>Role</span>
                        </Label>
                        <Input value={profile?.role || ""} disabled className="mt-2 bg-slate-50 capitalize" />
                        <p className="text-xs text-slate-500 mt-1">Role can only be changed by an administrator</p>
                    </div>

                    {/* Account Info */}
                    <div className="pt-4 border-t">
                        <Label className="text-slate-700">Member Since</Label>
                        <p className="text-sm text-slate-600 mt-1">
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  })
                                : "Unknown"}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={saving} className="px-8">
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={fetchProfile}>
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
