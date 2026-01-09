"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import {
    listProjectsApi,
    createProjectApi,
    updateProjectApi,
    deleteProjectApi,
    addProjectMemberApi,
    removeProjectMemberApi,
} from "@/services/projects.api";

export function useProjects() {
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    const projectsQuery = useQuery({
        queryKey: ["projects"],
        queryFn: listProjectsApi,
        enabled: !!currentUser,
    });

    const createProject = useMutation({
        mutationFn: createProjectApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const updateProject = useMutation({
        mutationFn: updateProjectApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const deleteProject = useMutation({
        mutationFn: deleteProjectApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const addMember = useMutation({
        mutationFn: addProjectMemberApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const removeMember = useMutation({
        mutationFn: removeProjectMemberApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    return {
        projects: projectsQuery.data || [],
        isLoading: projectsQuery.isLoading,
        error: projectsQuery.error,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        currentUser,
    };
}