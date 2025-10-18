"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Settings,
    Calendar,
    X,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: CheckSquare, label: "Tasks", href: "/tasks" },
        { icon: Calendar, label: "Calendar", href: "/calendar" },
        { icon: Users, label: "Team", href: "/team" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <CheckSquare className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold">TaskPro</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
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
                    ${
                        isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 cursor-pointer">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                    JD
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    John Doe
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    john@example.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
