"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Bell,
    Shield,
    Palette,
    Globe,
    Clock,
    Check,
    Mail,
    Calendar,
    Smartphone,
    LogOut,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/hook/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserSettings {
    email_notifications: boolean;
    task_reminders: boolean;
    weekly_digest: boolean;
    due_date_alerts: boolean;
    theme: "light" | "dark" | "system";
    compact_mode: boolean;
    show_email: boolean;
    two_factor_enabled: boolean;
    language: string;
    timezone: string;
    date_format: string;
}

export default function SettingsPage() {
    const { user, profile } = useAuth();
    const supabase = createClient();
    const router = useRouter();

    // Settings State
    const [settings, setSettings] = useState<UserSettings>({
        email_notifications: true,
        task_reminders: true,
        weekly_digest: false,
        due_date_alerts: true,
        theme: "light",
        compact_mode: false,
        show_email: true,
        two_factor_enabled: false,
        language: "en",
        timezone: "Asia/Ho_Chi_Minh",
        date_format: "DD/MM/YYYY",
    });

    // Password State
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Loading States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordChanging, setPasswordChanging] = useState(false);

    // Load settings from Supabase
    useEffect(() => {
        loadSettings();
    }, [user]);

    const loadSettings = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single();

            if (data && !error) {
                setSettings({
                    email_notifications: data.email_notifications ?? true,
                    task_reminders: data.task_reminders ?? true,
                    weekly_digest: data.weekly_digest ?? false,
                    due_date_alerts: data.due_date_alerts ?? true,
                    theme: data.theme ?? "light",
                    compact_mode: data.compact_mode ?? false,
                    show_email: data.show_email ?? true,
                    two_factor_enabled: data.two_factor_enabled ?? false,
                    language: data.language ?? "en",
                    timezone: data.timezone ?? "Asia/Ho_Chi_Minh",
                    date_format: data.date_format ?? "DD/MM/YYYY",
                });
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const { error } = await supabase.from("user_settings").upsert(
                {
                    user_id: user.id,
                    ...settings,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id",
                }
            );

            if (error) throw error;

            // Apply theme immediately
            if (settings.theme === "dark") {
                document.documentElement.classList.add("dark");
            } else if (settings.theme === "light") {
                document.documentElement.classList.remove("dark");
            } else {
                // System theme
                const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (systemDark) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }

            alert("✅ Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("❌ Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            alert("❌ Please fill in both password fields!");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        if (newPassword.length < 6) {
            alert("❌ Password must be at least 6 characters!");
            return;
        }

        setPasswordChanging(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            alert("✅ Password changed successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Error changing password:", error);
            alert("❌ Failed to change password. Please try again.");
        } finally {
            setPasswordChanging(false);
        }
    };

    const handleLogoutAllDevices = async () => {
        if (!confirm("Are you sure you want to logout from all devices? You will need to login again.")) return;

        try {
            await supabase.auth.signOut({ scope: "global" });
            router.push("/login");
        } catch (error) {
            console.error("Error logging out:", error);
            alert("❌ Failed to logout");
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("⚠️ Are you ABSOLUTELY sure? This will permanently delete your account and all data!")) return;

        const confirmation = prompt("Type 'DELETE' in capital letters to confirm:");
        if (confirmation !== "DELETE") {
            alert("Account deletion cancelled.");
            return;
        }

        try {
            // Call delete API
            const response = await fetch(`/api/users?id=${user?.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete account");

            alert("✅ Account deleted successfully");
            await supabase.auth.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("❌ Failed to delete account. Please contact support.");
        }
    };

    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-blue-600" : "bg-slate-300"
            }`}>
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-2">Manage your account preferences and application settings</p>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                        <p className="text-sm text-slate-600">Configure how you receive notifications</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900">Email Notifications</p>
                                <p className="text-sm text-slate-600">Receive email updates about your tasks</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={settings.email_notifications}
                            onChange={() => updateSetting("email_notifications", !settings.email_notifications)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900">Task Reminders</p>
                                <p className="text-sm text-slate-600">Get reminded about upcoming tasks</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={settings.task_reminders}
                            onChange={() => updateSetting("task_reminders", !settings.task_reminders)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900">Due Date Alerts</p>
                                <p className="text-sm text-slate-600">Alert when tasks are due soon</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={settings.due_date_alerts}
                            onChange={() => updateSetting("due_date_alerts", !settings.due_date_alerts)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900">Weekly Digest</p>
                                <p className="text-sm text-slate-600">Receive weekly summary emails</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={settings.weekly_digest}
                            onChange={() => updateSetting("weekly_digest", !settings.weekly_digest)}
                        />
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Appearance</h2>
                        <p className="text-sm text-slate-600">Customize how the app looks</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="mb-3 block">Theme</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {(["light", "dark", "system"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => updateSetting("theme", t)}
                                    className={`p-4 border-2 rounded-lg transition-all capitalize ${
                                        settings.theme === t
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-slate-200 hover:border-slate-300"
                                    }`}>
                                    {settings.theme === t && <Check className="w-4 h-4 text-blue-600 mb-2" />}
                                    <span className="font-medium">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Compact Mode</p>
                            <p className="text-sm text-slate-600">Reduce spacing between elements</p>
                        </div>
                        <ToggleSwitch
                            enabled={settings.compact_mode}
                            onChange={() => updateSetting("compact_mode", !settings.compact_mode)}
                        />
                    </div>
                </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Language & Region</h2>
                        <p className="text-sm text-slate-600">Set your language and regional preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Language</Label>
                        <select
                            value={settings.language}
                            onChange={(e) => updateSetting("language", e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="en">English</option>
                            <option value="vi">Tiếng Việt</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                    </div>

                    <div>
                        <Label>Timezone</Label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => updateSetting("timezone", e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Asia/Ho_Chi_Minh">Ho Chi Minh (GMT+7)</option>
                            <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                            <option value="America/New_York">New York (GMT-5)</option>
                            <option value="Europe/London">London (GMT+0)</option>
                        </select>
                    </div>

                    <div>
                        <Label>Date Format</Label>
                        <select
                            value={settings.date_format}
                            onChange={(e) => updateSetting("date_format", e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Privacy & Security</h2>
                        <p className="text-sm text-slate-600">Manage your security settings</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900">Change Password</h3>

                        <div>
                            <Label>New Password</Label>
                            <div className="relative mt-2">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label>Confirm New Password</Label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="mt-2"
                            />
                        </div>

                        <Button onClick={handleChangePassword} disabled={passwordChanging} className="w-full">
                            {passwordChanging ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Changing...
                                </>
                            ) : (
                                "Change Password"
                            )}
                        </Button>
                    </div>

                    {/* Two Factor Auth */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                                <p className="text-sm text-slate-600">Add an extra layer of security</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={settings.two_factor_enabled}
                            onChange={() => updateSetting("two_factor_enabled", !settings.two_factor_enabled)}
                        />
                    </div>

                    {/* Privacy */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900">Show Email to Team</p>
                                <p className="text-sm text-slate-600">Let your team members see your email</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={settings.show_email}
                            onChange={() => updateSetting("show_email", !settings.show_email)}
                        />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
                        <p className="text-sm text-red-600">Irreversible and destructive actions</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="outline"
                        onClick={handleLogoutAllDevices}
                        className="w-full justify-start text-orange-600 border-orange-300 hover:bg-orange-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout from all devices
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleDeleteAccount}
                        className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                    </Button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save All Changes"
                    )}
                </Button>
            </div>
        </div>
    );
}
