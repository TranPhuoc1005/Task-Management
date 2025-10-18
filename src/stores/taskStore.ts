import { Column, Task } from "@/types/task";
import { create } from "zustand";

interface TaskStore {
    columns: Column[];
    setColumns: (columns: Column[]) => void;
    moveTask: (
        taskId: string,
        fromStatus: Task["status"],
        toStatus: Task["status"]
    ) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
}

// Mock data
const initialColumns: Column[] = [];

export const useTaskStore = create<TaskStore>((set) => ({
    columns: initialColumns,
    setColumns: (columns) => set({columns}),
    moveTask: (taskId, fromStatus, toStatus) => set((state) => {
        const newColumns = [...state.columns];
        const fromColumn = newColumns.find(col => col.status === fromStatus);
        const toColumn = newColumns.find(col => col.status === toStatus);

        if(fromColumn && toColumn) {
            const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId);
            if(taskIndex !== -1) {
                const [task] = fromColumn.tasks.splice(taskIndex, 1);
                task.status = toStatus;
                toColumn.tasks.push(task);
            }
        }
        return {
            columns: newColumns
        };
    }),

    addTask: (task) => set((state) => {
        const newColumns = [...state.columns];
        const columns = newColumns.find(col => col.status === task.status);
        if(columns) {
            columns.tasks.push(task);
        }
        return {
            columns: newColumns
        }
    }),

    updateTask: (taskId, updates) => set((state) => {
        const newColumns = state.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            ),
        }));
        return {
            columns: newColumns
        }
    }),

    deleteTask: (taskId) => set((state) => {
        const newColumns = state.columns.map(column => ({
            ...column,
            tasks: column.tasks.filter(task => task.id !== taskId)
        }));
        return {
            columns: newColumns
        }
    })
}))