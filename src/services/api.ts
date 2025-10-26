import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 30000,
};

// Get auth token từ Supabase
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

interface ApiError extends Error {
    status?: number;
    data?: unknown;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const token = await getAuthToken();

        const url = endpoint.startsWith("http")
            ? endpoint
            : `${API_CONFIG.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        const response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorData: unknown = null; // ✅ dùng unknown thay vì any

            try {
                errorData = await response.json();
            } catch (parseError) {
                console.error("❌ Failed to parse error response:", parseError);
                errorData = { error: response.statusText };
            }

            console.error(`❌ API Error [${options.method || "GET"}] ${endpoint}:`, {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
            });

            const extractMessage = (data: unknown): string | null => {
                if (typeof data === "object" && data !== null) {
                    const obj = data as Record<string, unknown>;
                    return (
                        (typeof obj.error === "string" && obj.error) ||
                        (typeof obj.message === "string" && obj.message) ||
                        (typeof obj.details === "string" && obj.details) ||
                        null
                    );
                }
                return null;
            };

            const errorMessage =
                extractMessage(errorData) ||
                `HTTP ${response.status}: ${response.statusText}`;

            const error: ApiError = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return {} as T;
        }

        return (await response.json()) as T;
    } catch (error: unknown) { // ✅ unknown thay cho any
        if (error instanceof Error && error.name === "AbortError") {
            console.error(`⏱️ Request timeout [${options.method || "GET"}] ${endpoint}`);
            throw new Error("Request timeout");
        }

        if (typeof error === "object" && error && "status" in error) {
            throw error;
        }

        console.error(
            `🔥 Unexpected error [${options.method || "GET"}] ${endpoint}:`,
            error
        );
        throw error;
    }
}

// API Client
const api = {
    get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
        request<T>(endpoint, { ...options, method: "GET" }),

    post: <T, D = unknown>(endpoint: string, data?: D, options?: RequestInit): Promise<T> => {
        const isFormData = data instanceof FormData;
        return request<T>(endpoint, {
            ...options,
            method: "POST",
            body: isFormData ? (data as FormData) : JSON.stringify(data),
            headers: isFormData ? {} : options?.headers,
        });
    },

    put: <T, D = unknown>(
        endpoint: string,
        data?: D,
        options?: RequestInit
    ): Promise<T> =>
        request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    patch: <T, D = unknown>(
        endpoint: string,
        data?: D,
        options?: RequestInit
    ): Promise<T> =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
        request<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
