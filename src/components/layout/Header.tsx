"use client";

import { Search, Menu } from "lucide-react";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-slate-600 hover:text-slate-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks, projects..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <NotificationDropdown />
                </div>
            </div>
        </header>
    );
}