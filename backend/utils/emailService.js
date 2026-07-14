import nodemailer from 'nodemailer'

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null

  // If SMTP_HOST is set, use generic SMTP (works with any provider —
  // Hostinger, Zoho, Brevo, Mailtrap, custom domain SMTP, etc.)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587/25
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
  }

  // Fallback: Gmail shortcut (no SMTP_HOST needed, just EMAIL_USER/EMAIL_PASS
  // with a Gmail App Password)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

const emailTemplates = {
  passwordReset: (userName, resetUrl) => ({
    subject: `🔒 Reset your SkillMatch password`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">Hey ${userName},</h2>
        <p style="color:#475569;">We got a request to reset your password. Click below to choose a new one — this link expires in <strong>30 minutes</strong>.</p>
        <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">SkillMatch — Built for students, by students.</p>
      </div>
    `,
  }),

  applicationSubmitted: (userName, jobTitle, company) => ({
    subject: `✅ Application submitted — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">Hey ${userName}! 👋</h2>
        <p style="color:#475569;">Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been submitted successfully.</p>
        <div style="background:#eef2ff;padding:16px;border-radius:12px;margin:24px 0;">
          <p style="color:#4338ca;margin:0;font-weight:600;">What happens next?</p>
          <p style="color:#6366f1;margin:8px 0 0;">The recruiter will review your profile and reach out if you're shortlisted. Track your application status on your dashboard.</p>
        </div>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Dashboard</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">SkillMatch — Built for students, by students.</p>
      </div>
    `,
  }),

  statusUpdate: (userName, jobTitle, status) => ({
    subject: `🔔 Application update — ${jobTitle}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">Update on your application</h2>
        <p style="color:#475569;">Hey ${userName}, your application for <strong>${jobTitle}</strong> has been updated.</p>
        <div style="background:${status === 'HIRED' ? '#dcfce7' : status === 'REJECTED' ? '#fee2e2' : '#eef2ff'};padding:16px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="font-size:24px;margin:0;">${status === 'HIRED' ? '🎉' : status === 'REJECTED' ? '😔' : status === 'INTERVIEW' ? '📅' : '📋'}</p>
          <p style="font-weight:700;font-size:18px;color:#1e293b;margin:8px 0 0;">${status}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Dashboard</a>
      </div>
    `,
  }),

  interviewScheduled: (userName, jobTitle, company, interviewDate, mode) => ({
    subject: `📅 Interview scheduled — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">Good news, ${userName}! 📅</h2>
        <p style="color:#475569;">Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> moved fast — you've got an interview scheduled.</p>
        <div style="background:#dcfce7;padding:16px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="font-size:28px;margin:0;">📅</p>
          <p style="font-weight:700;font-size:18px;color:#1e293b;margin:8px 0 0;">
            ${new Date(interviewDate).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}
          </p>
          <p style="color:#16a34a;margin:4px 0 0;font-weight:600;">${mode} interview</p>
        </div>
        <p style="color:#94a3b8;font-size:13px;">This slot was booked automatically because your profile was a strong match — the recruiter may reschedule it, so keep an eye on your dashboard.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px;">View Dashboard</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">SkillMatch — Built for students, by students.</p>
      </div>
    `,
  }),

  underReview: (userName, jobTitle, company) => ({
    subject: `📋 Still reviewing — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">Quick update, ${userName}</h2>
        <p style="color:#475569;">Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> is still being reviewed by the recruiter.</p>
        <div style="background:#eef2ff;padding:16px;border-radius:12px;margin:24px 0;">
          <p style="color:#4338ca;margin:0;font-weight:600;">We've nudged the recruiter for you</p>
          <p style="color:#6366f1;margin:8px 0 0;">We've sent them a reminder to review your profile. You'll be notified immediately the moment your status changes — no need to keep refreshing.</p>
        </div>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Dashboard</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">SkillMatch — Built for students, by students.</p>
      </div>
    `,
  }),

  newJobMatch: (userName, jobTitle, company, matchPercent) => ({
    subject: `🎯 New job match — ${matchPercent}% match found!`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">New job match found! 🎯</h2>
        <p style="color:#475569;">Hey ${userName}, a new job matches your skills with <strong>${matchPercent}% compatibility</strong>.</p>
        <div style="background:#eef2ff;padding:16px;border-radius:12px;margin:24px 0;">
          <p style="font-weight:700;color:#1e293b;margin:0;">${jobTitle}</p>
          <p style="color:#6366f1;margin:4px 0 0;">${company}</p>
          <p style="color:#4f46e5;font-size:24px;font-weight:bold;margin:8px 0 0;">${matchPercent}% Match</p>
        </div>
        <a href="${process.env.CLIENT_URL}/jobs" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Job</a>
      </div>
    `,
  }),

  otp: (userName, otp) => ({
    subject: `🔐 Your SkillMatch login OTP`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#4f46e5;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:24px;">SkillMatch</h1>
        </div>
        <h2 style="color:#1e293b;">Your login OTP</h2>
        <p style="color:#475569;">Hey ${userName}, use this OTP to complete your login:</p>
        <div style="background:#eef2ff;padding:24px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="font-size:40px;font-weight:bold;color:#4f46e5;letter-spacing:12px;margin:0;">${otp}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  }),
}

export const sendEmail = async (to, template) => {
  const transporter = createTransporter()
  if (!transporter) {
    console.log('Email not configured — skipping email send')
    return false
  }
  try {
    await transporter.sendMail({
      from: `"SkillMatch" <${process.env.EMAIL_USER}>`,
      to,
      ...template,
    })
    return true
  } catch (err) {
    console.error('Email send error:', err.message)
    return false
  }
}

export { emailTemplates }
