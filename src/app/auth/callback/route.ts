import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { emailTemplates } from '@/lib/emails/templates';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      try {
        const name = (data.user.user_metadata?.full_name as string) || '';
        const t = emailTemplates.welcome(name);
        await sendEmail({ to: data.user.email!, ...t });
      } catch (e) {
        console.warn('welcome email skipped', e);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=invalid_code`);
}
