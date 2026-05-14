import { NextRequest, NextResponse } from 'next/server';
import { logWebhook, markWebhook, verifyHmacSha256 } from '@/lib/webhooks/helpers';
import { processKirvano } from '@/lib/webhooks/processors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('x-kirvano-signature') || req.headers.get('signature') || null;
  const secret = process.env.KIRVANO_WEBHOOK_SECRET || '';
  if (secret && !verifyHmacSha256(raw, secret, sig)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }
  const event = body?.event || body?.status || 'unknown';
  const logId = await logWebhook('kirvano', event, body);

  try {
    await processKirvano(body);
    await markWebhook(logId, 'success');
    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    await markWebhook(logId, 'failed', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
