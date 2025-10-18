"use client";

import { useUIStore } from "@/stores/uiStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { sidebarOpen, toggleSidebar } = useUIStore();

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={toggleSidebar} />

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
