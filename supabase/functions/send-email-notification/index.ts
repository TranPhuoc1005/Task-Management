import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
    try {
        const { to, subject, taskTitle, taskDescription, dueDate, priority } = await req.json()

        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .priority-high { border-left-color: #EF4444; }
          .priority-medium { border-left-color: #F59E0B; }
          .priority-low { border-left-color: #3B82F6; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; color: #6B7280; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⏰ Task Deadline Reminder</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>This is a reminder that your task is approaching its deadline:</p>
            
            <div class="task-card priority-${priority}">
              <h2 style="margin-top: 0; color: #1F2937;">${taskTitle}</h2>
              <p style="color: #6B7280;">${taskDescription || 'No description'}</p>
              <div style="margin-top: 15px;">
                <strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}<br>
                <strong>⚡ Priority:</strong> <span style="text-transform: uppercase; color: ${priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#3B82F6'};">${priority}</span>
              </div>
            </div>

            <p>Don't forget to complete this task before the deadline!</p>
            
            <a href="https://your-app.vercel.app/tasks" class="button">View Task</a>

            <div class="footer">
              <p>You're receiving this email because you have a task in TaskPro.</p>
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