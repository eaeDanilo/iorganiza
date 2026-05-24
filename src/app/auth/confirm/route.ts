import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'magiclink'
    | 'invite'
    | 'email_change'
    | null;
  const next = searchParams.get('next') || '/dashboard';

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    console.error('[auth/confirm]', error.message);
    return NextResponse.redirect(`${origin}/auth/login?error=expired_link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
