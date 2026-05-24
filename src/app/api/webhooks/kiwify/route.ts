import { NextRequest, NextResponse } from 'next/server';
import { logWebhook, markWebhook, verifyHmacSha256 } from '@/lib/webhooks/helpers';
import { processKiwify } from '@/lib/webhooks/processors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('x-kiwify-signature') || req.headers.get('signature') || null;
  const secret = process.env.KIWIFY_WEBHOOK_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 500 });
  }
  if (!verifyHmacSha256(raw, secret, sig)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }
  const event = body?.webhook_event_type || body?.order_status || 'unknown';
  const logId = await logWebhook('kiwify', event, body);

  try {
    await processKiwify(body);
    await markWebhook(logId, 'success');
    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    await markWebhook(logId, 'failed', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
