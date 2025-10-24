// ============================================
// FILE: src/app/team/page.tsx
// ============================================
import type { Metadata } from "next";
import { Users, Mail, Phone, MapPin } from "lucide-react";

// Metadata cho trang Team
export const metadata: Metadata = {
    title: "Team - TaskPro",
    description: "Manage your team members and their roles",
    keywords: ["team", "members", "collaboration", "task management"],
    openGraph: {
        title: "Team - TaskPro",
        description: "Manage your team members and their roles",
        type: "website",
    },
};

// Mock team data
const teamMembers = [
    {
        id: "1",
        name: "John Doe",
        role: "Project Manager",
        email: "john@example.com",
        phone: "+84 123 456 789",
        location: "Ho Chi Minh City",
        avatar: "JD",
        tasksCompleted: 45,
        activeProjects: 3,
    },
    {
        id: "2",
        name: "Jane Smith",
        role: "Senior Developer",
        email: "jane@example.com",
        phone: "+84 987 654 321",
        location: "Hanoi",
        avatar: "JS",
        tasksCompleted: 67,
        activeProjects: 5,
    },
    {
        id: "3",
        name: "Bob Johnson",
        role: "UI/UX Designer",
        email: "bob@example.com",
        phone: "+84 555 123 456",
        location: "Da Nang",
        avatar: "BJ",
        tasksCompleted: 34,
        activeProjects: 2,
    },
    {
        id: "4",
        name: "Alice Brown",
        role: "DevOps Engineer",
        email: "alice@example.com",
        phone: "+84 777 888 999",
        location: "Ho Chi Minh City",
        avatar: "AB",
        tasksCompleted: 52,
        activeProjects: 4,
    },
];

export default function TeamPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Team Members
                </h1>
                <p className="text-slate-600 mt-2">
                    Manage your team and track their progress
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">
                                Total Members
                            </p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">
                                {teamMembers.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">
                                Active Projects
                            </p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">
                                {teamMembers.reduce(
                                    (sum, member) =>
                                        sum + member.activeProjects,
                                    0
                                )}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">
                                Tasks Completed
                            </p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">
                                {teamMembers.reduce(
                                    (sum, member) =>
                                        sum + member.tasksCompleted,
                                    0
                                )}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
                    >
                        {/* Avatar */}
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-white">
                                    {member.avatar}
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                                {member.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {member.role}
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4" />
                                <span>{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span>{member.location}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex justify-between text-sm">
                                <div>
                                    <p className="text-slate-600">Tasks</p>
                                    <p className="font-semibold text-slate-900">
                                        {member.tasksCompleted}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Projects</p>
                                    <p className="font-semibold text-slate-900">
                                        {member.activeProjects}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            View Profile
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
