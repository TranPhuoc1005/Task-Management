"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Code, Palette, X, Building2, Mail } from "lucide-react";
import { Project, ProjectStatus, ProjectType } from "@/types/projects";

interface ProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project | null;
    onSubmit: (data: Partial<Project>) => void;
    isSubmitting?: boolean;
}

const PROJECT_TYPES = [
    { value: "web_development", label: "Web Development", icon: "🌐" },
    { value: "mobile_app", label: "Mobile App", icon: "📱" },
    { value: "design", label: "Design", icon: "🎨" },
    { value: "infrastructure", label: "Infrastructure", icon: "🔧" },
    { value: "data_science", label: "Data Science", icon: "📊" },
    { value: "other", label: "Other", icon: "📦" },
];

const TECH_SUGGESTIONS = [
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express",
    "Next.js",
    "Nest.js",
    "Python",
    "Django",
    "Flask",
    "FastAPI",
    "Java",
    "Spring Boot",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Jenkins",
];

const LANGUAGE_SUGGESTIONS = [
    "TypeScript",
    "JavaScript",
    "Python",
    "Java",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Dart",
    "Scala",
];

const PROJECT_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#6366f1",
];

export default function ProjectModal({ open, onOpenChange, project, onSubmit, isSubmitting }: ProjectModalProps) {
    const isEdit = !!project;

    const [formData, setFormData] = useState<Partial<Project>>({
        name: "",
        description: "",
        project_type: "web_development",
        status: "planning",
        technologies: [],
        programming_languages: [],
        start_date: new Date().toISOString().split("T")[0],
        deadline: "",
        budget: 0,
        currency: "USD",
        client_name: "",
        client_email: "",
        priority: "medium",
        color: "#3b82f6",
        progress: 0,
    });

    const [techInput, setTechInput] = useState("");
    const [langInput, setLangInput] = useState("");

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                start_date: project.start_date ? project.start_date.split("T")[0] : "",
                deadline: project.deadline ? project.deadline.split("T")[0] : "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                project_type: "web_development",
                status: "planning",
                technologies: [],
                programming_languages: [],
                start_date: new Date().toISOString().split("T")[0],
                deadline: "",
                budget: 0,
                currency: "USD",
                client_name: "",
                client_email: "",
                priority: "medium",
                color: "#3b82f6",
                progress: 0,
            });
            setTechInput("");
            setLangInput("");
        }
    }, [project, open]);

    const handleAddTech = (tech: string) => {
        if (tech && !formData.technologies?.includes(tech)) {
            setFormData({
                ...formData,
                technologies: [...(formData.technologies || []), tech],
            });
            setTechInput("");
        }
    };

    const handleRemoveTech = (tech: string) => {
        setFormData({
            ...formData,
            technologies: formData.technologies?.filter((t) => t !== tech),
        });
    };

    const handleAddLang = (lang: string) => {
        if (lang && !formData.programming_languages?.includes(lang)) {
            setFormData({
                ...formData,
                programming_languages: [...(formData.programming_languages || []), lang],
            });
            setLangInput("");
        }
    };

    const handleRemoveLang = (lang: string) => {
        setFormData({
            ...formData,
            programming_languages: formData.programming_languages?.filter((l) => l !== lang),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {isEdit ? "Edit Project" : "Create New Project"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update project information and settings"
                            : "Fill in the details to create a new project"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="name">
                                    Project Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="E-Commerce Platform Redesign"
                                    required
                                    className="mt-2"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the project..."
                                    rows={3}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="project_type">Project Type</Label>
                                <Select
                                    value={formData.project_type}
                                    onValueChange={(value: ProjectType) => setFormData({ ...formData, project_type: value })}>
                                    <SelectTrigger id="project_type" className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROJECT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.icon} {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger id="status" className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planning">📋 Planning</SelectItem>
                                        <SelectItem value="active">🚀 Active</SelectItem>
                                        <SelectItem value="on_hold">⏸️ On Hold</SelectItem>
                                        <SelectItem value="completed">✅ Completed</SelectItem>
                                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Technologies */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <Label className="flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                Technologies
                            </Label>
                            <div className="mt-2 space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddTech(techInput);
                                            }
                                        }}
                                        placeholder="Type and press Enter (e.g., React, Node.js)"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleAddTech(techInput)}
                                        disabled={!techInput}>
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {TECH_SUGGESTIONS.slice(0, 8).map((tech) => (
                                        <button
                                            key={tech}
                                            type="button"
                                            onClick={() => handleAddTech(tech)}
                                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                            + {tech}
                                        </button>
                                    ))}
                                </div>
                                {formData.technologies && formData.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formData.technologies.map((tech) => (
                                            <span
                                                key={tech}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {tech}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTech(tech)}
                                                    className="hover:text-blue-900">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                Programming Languages
                            </Label>
                            <div className="mt-2 space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={langInput}
                                        onChange={(e) => setLangInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddLang(langInput);
                                            }
                                        }}
                                        placeholder="Type and press Enter (e.g., TypeScript)"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleAddLang(langInput)}
                                        disabled={!langInput}>
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGE_SUGGESTIONS.slice(0, 6).map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => handleAddLang(lang)}
                                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:bg-green-50 hover:border-green-300 transition-colors">
                                            + {lang}
                                        </button>
                                    ))}
                                </div>
                                {formData.programming_languages && formData.programming_languages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formData.programming_languages.map((lang) => (
                                            <span
                                                key={lang}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {lang}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLang(lang)}
                                                    className="hover:text-green-900">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_date" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Start Date
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="deadline" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Deadline <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                required
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="budget" className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Budget
                            </Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                                placeholder="150000"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                                <SelectTrigger id="currency" className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                                    <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                                    <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                                    <SelectItem value="VND">🇻🇳 VND (₫)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="client_name" className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Client Name
                            </Label>
                            <Input
                                id="client_name"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                placeholder="TechCorp Inc"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="client_email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Client Email
                            </Label>
                            <Input
                                id="client_email"
                                type="email"
                                value={formData.client_email}
                                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                placeholder="contact@techcorp.com"
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Priority & Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: Project["priority"]) => setFormData({ ...formData, priority: value })}>
                                <SelectTrigger id="priority" className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">🟢 Low</SelectItem>
                                    <SelectItem value="medium">🟡 Medium</SelectItem>
                                    <SelectItem value="high">🟠 High</SelectItem>
                                    <SelectItem value="critical">🔴 Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Project Color
                            </Label>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {PROJECT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                            formData.color === color
                                                ? "border-slate-900 scale-110 shadow-lg"
                                                : "border-transparent hover:scale-105"
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    {isEdit && (
                        <div>
                            <Label htmlFor="progress">Progress (%)</Label>
                            <Input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                                className="mt-2"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.name || !formData.deadline}
                        className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
