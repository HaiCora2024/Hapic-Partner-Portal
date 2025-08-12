
// lib/email.ts
import sg from "@sendgrid/mail";
import nodemailer from "nodemailer";

export async function sendLoginCode(to: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hapic Partner Portal - Код для входа</h2>
      <p>Ваш код для входа: <strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
      <p>Код действует 10 минут. Если вы не запрашивали код, просто удалите письмо.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Это автоматическое письмо, не отвечайте на него.</p>
    </div>
  `;

  const fromEmail = process.env.FROM_EMAIL || "no-reply@yourdomain.com";

  try {
    if (process.env.SENDGRID_API_KEY) {
      if (!process.env.FROM_EMAIL) {
        console.warn('Warning: FROM_EMAIL not set, using default. Emails may not be delivered.');
      }
      sg.setApiKey(process.env.SENDGRID_API_KEY);
      await sg.send({ 
        to, 
        from: fromEmail, 
        subject: "Hapic Partner Portal - Код для входа", 
        html 
      });
      console.log(`Email sent to ${to} via SendGrid`);
      return;
    }

    if (process.env.SMTP_HOST) {
      if (!process.env.FROM_EMAIL) {
        console.warn('Warning: FROM_EMAIL not set, using SMTP_USER as sender.');
      }
      const t = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465', // Use SSL for port 465
        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
      });
      
      await t.sendMail({ 
        to, 
        from: fromEmail, 
        subject: "Hapic Partner Portal - Код для входа", 
        html 
      });
      console.log(`Email sent to ${to} via SMTP`);
      return;
    }
    
    console.warn('No email service configured. Email not sent. Configure SENDGRID_API_KEY or SMTP settings in .env.local');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email code');
  }
}
