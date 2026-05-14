import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { logWebhook, markWebhook } from '@/lib/webhooks/helpers';
import { processStripeEvent } from '@/lib/webhooks/processors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  let logId: string | undefined;
  try {
    if (!secret || !sig) throw new Error('Missing signature');
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
    logId = await logWebhook('stripe', event.type, event);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'invalid signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    await processStripeEvent(event);
    await markWebhook(logId, 'success');
    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'processing error';
    await markWebhook(logId, 'failed', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
