import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    try {
        // Get tasks sắp hết hạn trong 24h và chưa gửi email hôm nay
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .neq('status', 'done')
            .gte('due_date', new Date().toISOString().split('T')[0])
            .lte('due_date', tomorrow.toISOString().split('T')[0])
            .or('last_email_sent.is.null,last_email_sent.lt.' + today.toISOString())

        if (error) throw error

        const results = []

        for (const task of tasks || []) {
            if (!task.assignee) continue

            // Gửi email
            const emailResponse = await fetch(
                `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email-notification`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                    },
                    body: JSON.stringify({
                        to: task.assignee_email || task.assignee + '@example.com',
                        subject: `⏰ Reminder: "${task.title}" is due soon`,
                        taskTitle: task.title,
                        taskDescription: task.description,
                        dueDate: task.due_date,
                        priority: task.priority
                    })
                }
            )

            const emailResult = await emailResponse.json()

            if (emailResponse.ok) {
                // Update last_email_sent
                await supabase
                    .from('tasks')
                    .update({ last_email_sent: new Date().toISOString() })
                    .eq('id', task.id)

                results.push({ taskId: task.id, status: 'sent', emailId: emailResult.emailId })
            } else {
                results.push({ taskId: task.id, status: 'failed', error: emailResult.error })
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                tasksChecked: tasks?.length || 0,
                emailsSent: results.filter(r => r.status === 'sent').length,
                results
            }),
            {
                headers: { "Content-Type": "application/json" },
                status: 200
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { "Content-Type": "application/json" },
                status: 500
            }
        )
    }
})