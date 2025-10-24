import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // 👇 Lấy thời gian hiện tại và 24h tới
    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    console.log('Current time:', now.toISOString())
    console.log('Checking tasks due before:', in24Hours.toISOString())

    // 👇 Query tasks sắp hết hạn trong 24h
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .neq('status', 'done')
      .gte('due_date', now.toISOString())
      .lte('due_date', in24Hours.toISOString())
      .not('user_id', 'is', null)

    if (error) throw error

    console.log(`Found ${tasks?.length || 0} tasks to notify`)

    // 👇 Filter: Chỉ gửi email 1 lần trong ngày
    const tasksToNotify = tasks?.filter(task => {
      if (!task.last_email_sent) return true
      
      const lastSent = new Date(task.last_email_sent)
      const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)
      
      return hoursSinceLastSent >= 24 // Chỉ gửi lại sau 24h
    })

    console.log(`After filtering: ${tasksToNotify?.length || 0} tasks will receive email`)

    const results = []

    for (const task of tasksToNotify || []) {
      if (!task.profiles || !task.profiles.email) {
        console.log(`Skipping task ${task.id}: user has no email`)
        continue
      }

      const userEmail = task.profiles.email
      const userName = task.profiles.full_name || userEmail

      // 👇 Tính thời gian còn lại
      const dueDate = new Date(task.due_date)
      const hoursLeft = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))

      console.log(`Sending email for task ${task.id} to ${userEmail} (${hoursLeft}h left)`)

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
            to: userEmail,
            subject: `⏰ Reminder: "${task.title}" is due in ${hoursLeft}h`,
            taskTitle: task.title,
            taskDescription: task.description,
            dueDate: task.due_date,
            priority: task.priority,
            userName: userName,
            hoursLeft: hoursLeft // 👈 Thêm giờ còn lại
          })
        }
      )

      const emailResult = await emailResponse.json()

      if (emailResponse.ok) {
        // Update last_email_sent
        await supabase
          .from('tasks')
          .update({ last_email_sent: now.toISOString() })
          .eq('id', task.id)

        results.push({ 
          taskId: task.id, 
          status: 'sent', 
          emailId: emailResult.emailId,
          sentTo: userEmail,
          hoursLeft: hoursLeft
        })
      } else {
        results.push({ 
          taskId: task.id, 
          status: 'failed', 
          error: emailResult.error,
          userEmail: userEmail
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        currentTime: now.toISOString(),
        tasksFound: tasks?.length || 0,
        tasksFiltered: tasksToNotify?.length || 0,
        emailsSent: results.filter(r => r.status === 'sent').length,
        results 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})