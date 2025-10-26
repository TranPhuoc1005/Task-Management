// File: /services/api.ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// API Configuration
const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 30000,
};

// Get auth token từ Supabase
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

// Generic request handler
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const token = await getAuthToken();
        
        const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseURL}${endpoint}`;
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
            let errorData: any = null;
            
            try {
                errorData = await response.json();
            } catch (parseError) {
                console.error("❌ Failed to parse error response:", parseError);
                errorData = { error: response.statusText };
            }
            
            // Debug log
            console.error(`❌ API Error [${options.method || 'GET'}] ${endpoint}:`, {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
            });
            
            // Extract error message with multiple fallbacks
            const errorMessage = 
                (typeof errorData?.error === 'string' ? errorData.error : null) ||
                (typeof errorData?.message === 'string' ? errorData.message : null) ||
                (typeof errorData?.details === 'string' ? errorData.details : null) ||
                `HTTP ${response.status}: ${response.statusText}`;
            
            const error = new Error(errorMessage);
            (error as any).status = response.status;
            (error as any).data = errorData;
            throw error;
        }

        // Nếu response empty (204 No Content)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return {} as T;
        }

        return await response.json();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error(`⏱️ Request timeout [${options.method || 'GET'}] ${endpoint}`);
            throw new Error('Request timeout');
        }
        
        // Re-throw if already handled
        if (error.status) {
            throw error;
        }
        
        // Unknown error
        console.error(`🔥 Unexpected error [${options.method || 'GET'}] ${endpoint}:`, error);
        throw error;
    }
}

// API Client
const api = {
    get: <T>(endpoint: string, options?: RequestInit): Promise<T> => 
        request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
        const isFormData = data instanceof FormData;
        return request<T>(endpoint, {
            ...options,
            method: "POST",
            body: isFormData ? data : JSON.stringify(data),
            headers: isFormData ? {} : options?.headers,
        });
    },

    put: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => 
        request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => 
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => 
        request<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;