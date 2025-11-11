"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, CheckSquare, Users, Settings, Calendar, X, User, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hook/useAuth";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile, isLoading } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: CheckSquare, label: "Tasks", href: "/tasks" },
        { icon: Calendar, label: "Calendar", href: "/calendar" },
        { icon: Users, label: "Team", href: "/team" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    if (profile?.role === "admin" || profile?.role === "manager") {
        menuItems.push({ icon: Users, label: "Users", href: "/users" });
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await supabase.auth.signOut();
        // Redirect to login
        router.push("/login");
        router.refresh();
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-slate-900 text-white
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <CheckSquare className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold">TaskPro THP</span>
                        </Link>
                        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            onClose();
                                        }
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}>
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-slate-800 relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {profile?.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        width={40}
                                        height={40}
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">{getInitials(profile?.full_name)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">
                                    {isLoading ? "Loading..." : profile?.full_name || user?.email || "Unknown User"}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform ${
                                    showDropdown ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {showDropdown && (
                            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
                                <Link
                                    href="/profile"
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 transition-colors">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm">Profile Settings</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 transition-colors text-red-400 disabled:opacity-50">
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
