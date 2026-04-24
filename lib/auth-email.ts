import { Resend } from "resend";

import { getBaseUrl, getResendConfig } from "@/lib/auth-env";

function requireResend() {
  const config = getResendConfig();

  if (!config.apiKey || !config.from) {
    throw new Error(
      "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    );
  }

  return new Resend(config.apiKey);
}

function emailLayout(title: string, body: string, actionLabel: string, actionUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 32px; background: #f8fafc; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.2em; color: #64748b; text-transform: uppercase;">ProfitResearch Auth</p>
        <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">${title}</h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #475569;">${body}</p>
        <a href="${actionUrl}" style="display: inline-block; padding: 14px 20px; border-radius: 9999px; background: #0f172a; color: #fff; text-decoration: none; font-weight: 600;">
          ${actionLabel}
        </a>
        <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.7; color: #64748b;">
          If the button does not work, open this link:<br />
          <a href="${actionUrl}" style="color: #0f766e;">${actionUrl}</a>
        </p>
      </div>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const resend = requireResend();
  const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: getResendConfig().from,
    to: email,
    subject: "Verify your ProfitResearch account",
    html: emailLayout(
      "Verify your email",
      "Confirm your email address to activate your account and start saving private research records.",
      "Verify email",
      verifyUrl,
    ),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resend = requireResend();
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: getResendConfig().from,
    to: email,
    subject: "Reset your ProfitResearch password",
    html: emailLayout(
      "Reset your password",
      "Use the secure link below to choose a new password for your account.",
      "Reset password",
      resetUrl,
    ),
  });
}
