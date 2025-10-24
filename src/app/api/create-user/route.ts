// FILE: src/app/api/create-user/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const { email, password, full_name, role, department } = await request.json();

        const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name },
        });

        if (createError) throw createError;

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ full_name, role, department })
            .eq('id', user.user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            user: { email: user.user.email, id: user.user.id }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}