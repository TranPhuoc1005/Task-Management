"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Users,
    Clock,
    AlertCircle,
    Settings,
    Trash2,
    Edit2,
    Plus,
    CheckCircle2,
    TrendingUp,
    Code,
    Briefcase,
    Mail,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hook/useProjects";

const PROJECT_TYPE_LABELS = {
    web_development: "Web Development",
    mobile_app: "Mobile App",
    design: "Design",
    infrastructure: "Infrastructure",
    data_science: "Data Science",
    other: "Other",
};

const STATUS_COLORS = {
    planning: "bg-gray-100 text-gray-700 border-gray-300",
    active: "bg-green-100 text-green-700 border-green-300",
    on_hold: "bg-yellow-100 text-yellow-700 border-yellow-300",
    completed: "bg-blue-100 text-blue-700 border-blue-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_COLORS = {
    low: "bg-blue-50 text-blue-700 border-blue-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
};

const MEMBER_ROLE_LABELS = {
    project_manager: "Project Manager",
    tech_lead: "Tech Lead",
    developer: "Developer",
    designer: "Designer",
    qa_tester: "QA Tester",
    devops: "DevOps",
    business_analyst: "Business Analyst",
};

interface ProjectDetailPageProps {
    projectId: string;
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
    const router = useRouter();
    const { projects, deleteProject, currentUser } = useProjects();
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks" | "settings">("overview");

    const project = projects.find((p) => p.id === projectId);
    console.log(project)

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Project not found</h2>
                    <Button onClick={() => router.push("/projects")} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    const getDaysUntilDeadline = (deadline: string) => {
        const now = new Date();
        const due = new Date(deadline);
        const diffTime = due.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = project.deadline ? getDaysUntilDeadline(project.deadline) : null;
    const isOverdue = daysLeft !== null && daysLeft < 0;
    const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

    const canManageProject =
        currentUser?.profile?.role === "admin" ||
        currentUser?.profile?.role === "manager" ||
        project.created_by === currentUser?.id;

    const handleDeleteProject = async () => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject.mutateAsync(projectId);
                router.push("/projects");
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        onClick={() => router.push("/projects")}
                        variant="ghost"
                        className="mb-4 hover:bg-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                        {/* Color Bar */}
                        <div className="h-3" style={{ backgroundColor: project.color }} />

                        <div className="p-8">
                            {/* Title Section */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                                        <span
                                            className={`px-3 py-1 text-sm font-medium rounded-full border ${
                                                STATUS_COLORS[project.status]
                                            }`}>
                                            {project.status.replace("_", " ")}
                                        </span>
                                        <span
                                            className={`px-3 py-1 text-sm font-bold rounded-full border ${
                                                PRIORITY_COLORS[project.priority]
                                            }`}>
                                            {project.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    {project.description && (
                                        <p className="text-slate-600 leading-relaxed mb-4">{project.description}</p>
                                    )}
                                    <div className="flex items-center gap-6 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{PROJECT_TYPE_LABELS[project.project_type]}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Created {new Date(project.created_at).toLocaleDateString("en-US")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {canManageProject && (
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="bg-white">
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-white text-red-600 hover:bg-red-50"
                                            onClick={handleDeleteProject}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Deadline Warning */}
                            {(isOverdue || isDueSoon) && (
                                <div
                                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                                        isOverdue
                                            ? "bg-red-50 border border-red-200"
                                            : "bg-orange-50 border border-orange-200"
                                    }`}>
                                    <AlertCircle
                                        className={`w-5 h-5 ${isOverdue ? "text-red-600" : "text-orange-600"}`}
                                    />
                                    <span className={`font-medium ${isOverdue ? "text-red-700" : "text-orange-700"}`}>
                                        {isOverdue
                                            ? `This project is overdue by ${Math.abs(daysLeft!)} days`
                                            : `This project is due in ${daysLeft} days`}
                                    </span>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium">Progress</p>
                                            <p className="text-2xl font-bold text-blue-900">{project.progress}%</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-700 font-medium">Team</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                {project.members?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-purple-700 font-medium">Tasks</p>
                                            <p className="text-2xl font-bold text-purple-900">
                                                {project.tasks_count || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-orange-700 font-medium">Budget</p>
                                            <p className="text-2xl font-bold text-orange-900">
                                                ${((project.budget || 0) / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-slate-200">
                                <nav className="flex gap-6">
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                                            activeTab === "overview"
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-slate-600 hover:text-slate-900"
                                        }`}>
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("members")}
                                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                                            activeTab === "members"
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-slate-600 hover:text-slate-900"
                                        }`}>
                                        Team Members
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("tasks")}
                                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                                            activeTab === "tasks"
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-slate-600 hover:text-slate-900"
                                        }`}>
                                        Tasks
                                    </button>
                                    {canManageProject && (
                                        <button
                                            onClick={() => setActiveTab("settings")}
                                            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                                                activeTab === "settings"
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-slate-600 hover:text-slate-900"
                                            }`}>
                                            Settings
                                        </button>
                                    )}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Project Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Timeline */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Timeline</h3>

                                    {project.start_date && (
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Start Date</p>
                                                <p className="text-sm text-slate-600">
                                                    {new Date(project.start_date).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {project.deadline && (
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Deadline</p>
                                                <p className="text-sm text-slate-600">
                                                    {new Date(project.deadline).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {project.actual_completion_date && (
                                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-700">Completed</p>
                                                <p className="text-sm text-green-600">
                                                    {new Date(project.actual_completion_date).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Client & Budget */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Client & Budget</h3>

                                    {project.client_name && (
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-slate-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Client</p>
                                                <p className="text-sm text-slate-900 font-medium">
                                                    {project.client_name}
                                                </p>
                                                {project.client_email && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Mail className="w-3 h-3 text-slate-500" />
                                                        <p className="text-xs text-slate-600">{project.client_email}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-slate-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Total Budget</p>
                                            <p className="text-lg text-slate-900 font-bold">
                                                {project.currency} {(project.budget || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {project.project_manager && (
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Users className="w-5 h-5 text-slate-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Project Manager</p>
                                                <p className="text-sm text-slate-900 font-medium">
                                                    {project.project_manager.full_name}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {project.project_manager.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Technologies */}
                            {((project.technologies && project.technologies.length > 0) ||
                                (project.programming_languages && project.programming_languages.length > 0)) && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900">Tech Stack</h3>

                                    {project.technologies && project.technologies.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-2">Technologies</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.technologies.map((tech, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {project.programming_languages && project.programming_languages.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-2">
                                                Programming Languages
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.programming_languages.map((lang, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 text-sm font-medium bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                                                        <Code className="w-3 h-3 inline mr-1" />
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
                                {canManageProject && (
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Member
                                    </Button>
                                )}
                            </div>

                            {project.members && project.members.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {member.profile?.full_name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900">
                                                    {member.profile?.full_name || "Unknown"}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {MEMBER_ROLE_LABELS[member.role]}
                                                </p>
                                                {member.hourly_rate && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        ${member.hourly_rate}/hr
                                                        {member.allocated_hours &&
                                                            ` • ${member.allocated_hours}h allocated`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600">No team members yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "tasks" && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Tasks</h3>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                            </div>

                            <div className="text-center py-12">
                                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600 mb-4">Tasks feature coming soon</p>
                                <p className="text-sm text-slate-500">
                                    You&apos;ll be able to create and manage tasks here
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && canManageProject && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Project Settings</h3>
                            <div className="text-center py-12">
                                <Settings className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600">Project settings coming soon</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}