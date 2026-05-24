import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not set');
    _resend = new Resend(key);
  }
  return _resend;
}

export function fromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'no-reply@iorganiza.com.br';
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const resend = getResend();
  return resend.emails.send({
    from: fromEmail(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
