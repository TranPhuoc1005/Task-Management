"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, CheckSquare, Users, Settings, Calendar, X, User, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function getUserData() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

                if (profile) {
                    setUserRole(profile.role);
                    setUserProfile({
                        id: profile.id,
                        email: user.email || "",
                        full_name: profile.full_name,
                        role: profile.role,
                        department: profile.department,
                        avatar_url: profile.avatar_url,
                    });
                }
            }
        }

        getUserData();
    }, []);

    // Close dropdown when clicking outside
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

    // Chỉ thêm menu Users nếu role là admin hoặc manager
    if (userRole === "admin" || userRole === "manager") {
        menuItems.push({ icon: Users, label: "Users", href: "/users" });
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

            {/* Sidebar */}
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
                            <span className="text-xl font-bold">TaskPro</span>
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
                                    className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                  `}>
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
                                {userProfile?.avatar_url ? (
                                    <img
                                        src={userProfile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {getInitials(userProfile?.full_name || null)}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">{userProfile?.full_name || "Loading..."}</p>
                                <p className="text-xs text-slate-400 truncate">{userProfile?.email || ""}</p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform ${
                                    showDropdown ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
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
                                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 transition-colors text-red-400">
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
