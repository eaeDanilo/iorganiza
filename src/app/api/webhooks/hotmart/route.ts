import { NextRequest, NextResponse } from 'next/server';
import { logWebhook, markWebhook } from '@/lib/webhooks/helpers';
import { processHotmart } from '@/lib/webhooks/processors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const hottok = req.headers.get('x-hotmart-hottok');
  const expected = process.env.HOTMART_WEBHOOK_SECRET;
  if (expected && hottok !== expected) {
    return NextResponse.json({ error: 'invalid hottok' }, { status: 401 });
  }
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }
  const event = body?.event || 'unknown';
  const logId = await logWebhook('hotmart', event, body);

  try {
    await processHotmart(body);
    await markWebhook(logId, 'success');
    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    await markWebhook(logId, 'failed', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
