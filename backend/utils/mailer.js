const nodemailer = require('nodemailer');

// Password reset email is sent over SMTP only when the SMTP_* environment
// variables are configured. When they are not, sendPasswordReset reports
// that it did not send, so callers can fall back honestly (the reset link
// is logged for local development) instead of pretending an email went out.
const smtpConfigured = () => !!process.env.SMTP_HOST;

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });
  }
  return transporter;
};

async function sendPasswordReset(to, resetUrl) {
  if (!smtpConfigured()) {
    return { sent: false, reason: 'SMTP is not configured (SMTP_HOST is not set)' };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to,
    subject: 'Hotel Planner password reset',
    text: `A password reset was requested for your Hotel Planner account.\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
    html: `<p>A password reset was requested for your Hotel Planner account.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`
  });
  return { sent: true };
}

module.exports = { sendPasswordReset, smtpConfigured };
