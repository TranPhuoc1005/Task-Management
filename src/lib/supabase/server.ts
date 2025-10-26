import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Tạo Supabase client cho Next.js (App Router)
 * Tự động quản lý cookies (login / logout / refresh token)
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (err) {
                        console.error("Set cookie error:", err);
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: "", ...options });
                    } catch (err) {
                        console.error("Remove cookie error:", err);
                    }
                },
            },
        }
    );

    return supabase;
}
