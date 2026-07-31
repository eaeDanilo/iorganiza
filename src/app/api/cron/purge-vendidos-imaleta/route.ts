export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createIMaletaServiceClient, createIMaletaStorageClient } from '@/lib/imaleta/supabase';
import { toStoragePath } from '@/lib/imaleta/images';

const VENDIDOS_DIAS = 3;
const BUCKET = 'imaleta-imagens';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[purge-vendidos-imaleta] CRON_SECRET not configured');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createIMaletaServiceClient();
  const storage = createIMaletaStorageClient();

  const cutoff = new Date(Date.now() - VENDIDOS_DIAS * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidatos, error: fetchErr } = await supabase
    .from('produtos')
    .select('id, imagem_url')
    .eq('status', 'inactive')
    .is('deleted_at', null)
    .lt('updated_at', cutoff);

  if (fetchErr) {
    console.error('[purge-vendidos-imaleta] fetch error', fetchErr);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!candidatos || candidatos.length === 0) {
    return NextResponse.json({ purged: 0 });
  }

  const paths = candidatos.map((p) => toStoragePath(p.imagem_url)).filter((p): p is string => !!p);
  if (paths.length > 0) {
    const { error: removeErr } = await storage.storage.from(BUCKET).remove(paths);
    if (removeErr) console.error('[purge-vendidos-imaleta] storage remove error', removeErr);
  }

  const ids = candidatos.map((p) => p.id);
  const agora = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from('produtos')
    .update({ deleted_at: agora, imagem_url: null, updated_at: agora })
    .in('id', ids);

  if (updateErr) {
    console.error('[purge-vendidos-imaleta] update error', updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  console.log(`[purge-vendidos-imaleta] purged ${ids.length} produtos`);
  return NextResponse.json({ purged: ids.length });
}
