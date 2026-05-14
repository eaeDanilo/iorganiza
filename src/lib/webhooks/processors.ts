import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import {
  findOrCreateUser, findSaasByExternalIdentifier, notifyUser,
  recordPayment, upsertSubscription,
} from './helpers';
import type { WebhookProvider } from '@/types/database';

export async function processStripeEvent(event: Stripe.Event) {
  const supabase = createSupabaseServiceClient();
  if (event.type === 'checkout.session.completed') {
    const sess = event.data.object as Stripe.Checkout.Session;
    const userId = sess.metadata?.user_id;
    const saasId = sess.metadata?.saas_id;
    if (!userId || !saasId) return;
    const subId = (sess.subscription as string) || null;
    let periodEnd: string | null = null;
    if (subId) {
      const stripeSub = await getStripe().subscriptions.retrieve(subId);
      periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
    }
    const sub = await upsertSubscription({
      userId, saasId, status: 'active', paymentMethod: 'stripe',
      pricePaid: sess.amount_total ? sess.amount_total / 100 : null,
      stripeSubId: subId, stripeCustomerId: sess.customer as string,
      currentPeriodStart: new Date().toISOString(), currentPeriodEnd: periodEnd,
    });
    await recordPayment({
      userId, subscriptionId: sub.id,
      amount: sess.amount_total ? sess.amount_total / 100 : 0,
      currency: (sess.currency || 'brl').toUpperCase(),
      status: 'succeeded', paymentMethod: 'stripe',
      stripeTxId: sess.payment_intent as string,
    });
    await notifyUser(userId, 'activated', (sub as any).saas?.name || 'SaaS', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    return;
  }
  if (event.type === 'invoice.payment_succeeded') {
    const inv = event.data.object as Stripe.Invoice;
    const { data: sub } = await supabase
      .from('subscriptions').select('id, user_id, saas_id').eq('stripe_subscription_id', inv.subscription as string).maybeSingle();
    if (sub) {
      await recordPayment({
        userId: (sub as any).user_id, subscriptionId: (sub as any).id,
        amount: inv.amount_paid / 100, currency: (inv.currency || 'brl').toUpperCase(),
        status: 'succeeded', paymentMethod: 'stripe',
        stripeTxId: inv.payment_intent as string,
      });
    }
    return;
  }
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status === 'canceled' ? 'canceled' : 'pending';
    await supabase.from('subscriptions').update({
      status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }).eq('stripe_subscription_id', sub.id);
    return;
  }
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const { data } = await supabase.from('subscriptions').select('user_id, saas:saas(name)').eq('stripe_subscription_id', sub.id).maybeSingle();
    await supabase.from('subscriptions').update({ status: 'canceled', cancel_at: new Date().toISOString() }).eq('stripe_subscription_id', sub.id);
    if (data) await notifyUser((data as any).user_id, 'canceled', (data as any).saas?.name || 'SaaS');
    return;
  }
  if (event.type === 'invoice.payment_failed') {
    const inv = event.data.object as Stripe.Invoice;
    const { data } = await supabase.from('subscriptions').select('user_id, saas:saas(name)').eq('stripe_subscription_id', inv.subscription as string).maybeSingle();
    if (data) await notifyUser((data as any).user_id, 'failed', (data as any).saas?.name || 'SaaS');
    return;
  }
}

interface ExternalPayload {
  email?: string;
  fullName?: string;
  productName?: string;
  externalId?: string | null;
  amount?: number;
  approved: boolean;
  canceled: boolean;
}

async function processExternal(provider: 'kiwify' | 'hotmart' | 'kirvano', p: ExternalPayload, accessUrlFallback: string) {
  if (!p.email || !p.productName) throw new Error('missing customer or product');
  const saas = await findSaasByExternalIdentifier(p.productName);
  if (!saas) throw new Error(`SaaS não mapeado: ${p.productName}`);
  const userId = await findOrCreateUser(p.email, p.fullName);
  if (p.approved) {
    const sub = await upsertSubscription({
      userId, saasId: saas.id, status: 'active', paymentMethod: provider,
      pricePaid: p.amount ?? null, externalId: p.externalId ?? null,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    await recordPayment({
      userId, subscriptionId: sub.id, amount: p.amount ?? 0,
      status: 'succeeded', paymentMethod: provider, externalId: p.externalId ?? null,
    });
    await notifyUser(userId, 'activated', saas.name, saas.external_url || accessUrlFallback);
  } else if (p.canceled) {
    const supabase = createSupabaseServiceClient();
    await supabase.from('subscriptions')
      .update({ status: 'canceled', cancel_at: new Date().toISOString() })
      .eq('user_id', userId).eq('saas_id', saas.id);
    await notifyUser(userId, 'canceled', saas.name);
  }
}

export function parseKiwifyPayload(body: any): ExternalPayload {
  const status = String(body?.order_status || '').toLowerCase();
  const event = String(body?.webhook_event_type || '').toLowerCase();
  return {
    email: body?.Customer?.email,
    fullName: body?.Customer?.full_name,
    productName: body?.Product?.product_name,
    externalId: body?.order_id || null,
    amount: body?.Commissions?.charge_amount ? body.Commissions.charge_amount / 100 : undefined,
    approved: ['approved', 'paid', 'order_approved'].includes(status) || event.includes('approved'),
    canceled: ['canceled', 'refunded', 'chargeback'].includes(status) || event.includes('refund') || event.includes('cancel'),
  };
}

export function parseHotmartPayload(body: any): ExternalPayload {
  const event = String(body?.event || '');
  return {
    email: body?.data?.buyer?.email,
    fullName: body?.data?.buyer?.name,
    productName: body?.data?.product?.name,
    externalId: body?.data?.purchase?.transaction || null,
    amount: body?.data?.purchase?.price?.value,
    approved: ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'SUBSCRIPTION_RENEWED'].includes(event),
    canceled: ['PURCHASE_CANCELED', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION'].includes(event),
  };
}

export function parseKirvanoPayload(body: any): ExternalPayload {
  const status = String(body?.status || body?.event || '').toLowerCase();
  return {
    email: body?.customer?.email,
    fullName: body?.customer?.name,
    productName: body?.product?.name,
    externalId: body?.sale_id || null,
    amount: body?.total_price,
    approved: status.includes('approv') || status.includes('paid') || status.includes('complet'),
    canceled: status.includes('cancel') || status.includes('refund') || status.includes('chargeback'),
  };
}

export async function processKiwify(body: any) {
  return processExternal('kiwify', parseKiwifyPayload(body), `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}
export async function processHotmart(body: any) {
  return processExternal('hotmart', parseHotmartPayload(body), `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}
export async function processKirvano(body: any) {
  return processExternal('kirvano', parseKirvanoPayload(body), `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}

export async function replayWebhook(provider: WebhookProvider, payload: any) {
  if (provider === 'stripe') return processStripeEvent(payload as Stripe.Event);
  if (provider === 'kiwify') return processKiwify(payload);
  if (provider === 'hotmart') return processHotmart(payload);
  if (provider === 'kirvano') return processKirvano(payload);
  throw new Error(`Provider desconhecido: ${provider}`);
}
