import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

// 👇 THÊM CORS HEADERS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 👇 HANDLE OPTIONS REQUEST (preflight)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, taskTitle, taskDescription, dueDate, priority, userName, hoursLeft } = await req.json()

        const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* ... existing styles ... */
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⏰ Task Deadline Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'},</p>
          <p>This is a reminder that your task is approaching its deadline:</p>
          
          <div class="task-card priority-${priority}">
            <h2 style="margin-top: 0; color: #1F2937;">${taskTitle}</h2>
            <p style="color: #6B7280;">${taskDescription || 'No description'}</p>
            <div style="margin-top: 15px;">
              <strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}<br>
              <strong>⏰ Time Left:</strong> <span style="color: ${hoursLeft <= 3 ? '#EF4444' : hoursLeft <= 12 ? '#F59E0B' : '#10B981'};">${hoursLeft} hours</span><br>
              <strong>⚡ Priority:</strong> <span style="text-transform: uppercase; color: ${priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#3B82F6'};">${priority}</span>
            </div>
          </div>

          <p>${hoursLeft <= 3 ? '🔥 <strong>Urgent!</strong> Please complete this task as soon as possible.' : 'Don\'t forget to complete this task before the deadline!'}</p>
          
          <a href="https://task-management-brown-one.vercel.app/tasks" class="button">View Task</a>

          <div class="footer">
            <p>You're receiving this email because you have a task assigned to you in TaskPro.</p>
            <p>© ${new Date().getFullYear()} TaskPro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'TaskPro <notifications@resend.dev>',
                to: [to],
                subject: subject,
                html: emailHtml,
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email')
        }

        return new Response(
            JSON.stringify({ success: true, emailId: data.id }),
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