import { NextResponse, type NextRequest } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { emailTemplates } from '@/lib/emails/templates';

export const dynamic = 'force-dynamic';

async function verifyHookSignature(authHeader: string | null, secret: string): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const b64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
  const sigBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(`${parts[0]}.${parts[1]}`));
}

const ACTION_TYPE_MAP: Record<string, 'signup' | 'recovery' | 'magiclink' | 'invite' | 'email_change'> = {
  signup: 'signup',
  recovery: 'recovery',
  magiclink: 'magiclink',
  invite: 'invite',
  email_change_new: 'email_change',
  email_change_current: 'email_change',
};

export async function POST(request: NextRequest) {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (secret) {
    const valid = await verifyHookSignature(request.headers.get('authorization'), secret);
    if (!valid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { user, email_data } = body as {
    user: { email: string };
    email_data: {
      token_hash: string;
      email_action_type: string;
      site_url: string;
    };
  };

  const { token_hash, email_action_type, site_url } = email_data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || site_url;
  const verifyType = ACTION_TYPE_MAP[email_action_type];

  if (!verifyType) return NextResponse.json({});

  const next =
    verifyType === 'recovery' ? '/auth/reset-password' : '/dashboard';
  const confirmUrl = `${appUrl}/auth/confirm?token_hash=${encodeURIComponent(token_hash)}&type=${verifyType}&next=${next}`;

  let template: { subject: string; html: string };
  if (verifyType === 'recovery') {
    template = emailTemplates.resetPassword(confirmUrl);
  } else {
    template = emailTemplates.confirmEmail(confirmUrl);
  }

  try {
    await sendEmail({ to: user.email, ...template });
  } catch (e) {
    console.error('[send-email hook]', e);
    return NextResponse.json({ error: 'email_send_failed' }, { status: 500 });
  }

  return NextResponse.json({});
}
