export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { createICobraServiceClient } from '@/lib/icobra/supabase';

const CUTOFF_DAYS = 90;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const supabase = createSupabaseServiceClient();
  const icobra = createICobraServiceClient();

  const cutoff = new Date(Date.now() - CUTOFF_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error: fetchErr } = await supabase
    .from('users')
    .select('id')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff);

  if (fetchErr) {
    console.error('[purge-users] fetch error', fetchErr);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ purged: 0 });
  }

  const ids = candidates.map((u) => u.id);

  await Promise.allSettled([
    supabase.from('payments').delete().in('user_id', ids),
    supabase.from('subscriptions').delete().in('user_id', ids),
    icobra.from('emprestimos').delete().in('user_id', ids),
  ]);

  const { error: deleteErr } = await supabase.from('users').delete().in('id', ids);
  if (deleteErr) {
    console.error('[purge-users] delete error', deleteErr);
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  // Remove from auth.users via admin API
  await Promise.allSettled(
    ids.map((id) => supabase.auth.admin.deleteUser(id))
  );

  console.log(`[purge-users] purged ${ids.length} users`);
  return NextResponse.json({ purged: ids.length, ids });
}
