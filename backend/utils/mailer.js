// utils/mailer.js (ESM)
import nodemailer from "nodemailer";

/**
 * Returns a Nodemailer transport.
 * - Uses .env SMTP_* if present
 * - Otherwise creates an Ethereal test account (great for local dev)
 */
export function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    // Auto-create an Ethereal account for dev
    return nodemailer.createTestAccount().then((acct) =>
      nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: acct.user, pass: acct.pass },
      })
    );
  }

  return Promise.resolve(
    nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  );
}

/**
 * Sends an email and returns { messageId, previewUrl? }
 * previewUrl is available when using Ethereal.
 */
export async function sendMail({ to, subject, html, text }) {
  const transporter = await createTransport();
  const info = await transporter.sendMail({
    from: process.env.APP_FROM || '"Cake & Bake Payroll" <no-reply@cake.local>',
    to,
    subject,
    html,
    text,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  return { messageId: info.messageId, previewUrl };
}
