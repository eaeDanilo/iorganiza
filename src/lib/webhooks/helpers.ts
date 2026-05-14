import crypto from 'crypto';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { PaymentMethod, WebhookProvider } from '@/types/database';
import { sendEmail } from '@/lib/resend';
import { emailTemplates } from '@/lib/emails/templates';

export async function logWebhook(provider: WebhookProvider, eventType: string, payload: unknown) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('webhook_logs')
    .insert({ provider, event_type: eventType, payload: payload as any, status: 'pending_retry' })
    .select('id')
    .single();
  return data?.id as string | undefined;
}

export async function markWebhook(id: string | undefined, status: 'success' | 'failed', error?: string) {
  if (!id) return;
  const supabase = createSupabaseServiceClient();
  await supabase
    .from('webhook_logs')
    .update({ status, error_message: error ?? null, processed_at: new Date().toISOString() })
    .eq('id', id);
}

export function verifyHmacSha256(rawBody: string, secret: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature.replace(/^sha256=/, '')));
  } catch {
    return false;
  }
}

export async function findOrCreateUser(email: string, fullName?: string): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) return existing.id;
  // criar usuario no auth
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName || '' },
  });
  if (error || !created.user) throw new Error(error?.message || 'createUser failed');
  // O trigger handle_new_auth_user popula public.users.
  return created.user.id;
}

export async function findSaasBySlug(slug: string) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('saas').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function findSaasByExternalIdentifier(identifier: string) {
  const supabase = createSupabaseServiceClient();
  // tenta por slug primeiro, depois name
  const { data } = await supabase
    .from('saas')
    .select('*')
    .or(`slug.eq.${identifier},name.ilike.${identifier}`)
    .maybeSingle();
  return data;
}

export async function upsertSubscription(opts: {
  userId: string;
  saasId: string;
  status: 'active' | 'canceled' | 'pending' | 'expired';
  paymentMethod: PaymentMethod;
  pricePaid?: number | null;
  externalId?: string | null;
  stripeSubId?: string | null;
  stripeCustomerId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const supabase = createSupabaseServiceClient();
  const update: Record<string, unknown> = {
    user_id: opts.userId,
    saas_id: opts.saasId,
    status: opts.status,
    payment_method: opts.paymentMethod,
    price_paid: opts.pricePaid ?? null,
    current_period_start: opts.currentPeriodStart ?? null,
    current_period_end: opts.currentPeriodEnd ?? null,
  };
  if (opts.paymentMethod === 'stripe') {
    update.stripe_subscription_id = opts.stripeSubId;
    update.stripe_customer_id = opts.stripeCustomerId;
  } else if (opts.paymentMethod === 'kiwify') update.kiwify_purchase_id = opts.externalId;
  else if (opts.paymentMethod === 'hotmart') update.hotmart_purchase_id = opts.externalId;
  else if (opts.paymentMethod === 'kirvano') update.kirvano_purchase_id = opts.externalId;

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(update, { onConflict: 'user_id,saas_id' })
    .select('*, saas:saas(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function recordPayment(opts: {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency?: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  externalId?: string | null;
  stripeTxId?: string | null;
}) {
  const supabase = createSupabaseServiceClient();
  await supabase.from('payments').insert({
    user_id: opts.userId,
    subscription_id: opts.subscriptionId,
    amount: opts.amount,
    currency: opts.currency ?? 'BRL',
    status: opts.status,
    payment_method: opts.paymentMethod,
    external_transaction_id: opts.externalId ?? null,
    stripe_transaction_id: opts.stripeTxId ?? null,
  });
}

export async function notifyUser(userId: string, kind: 'activated' | 'canceled' | 'failed', saasName: string, accessUrl?: string) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
    if (!data) return;
    let t;
    if (kind === 'activated') t = emailTemplates.subscriptionActivated(saasName, accessUrl || process.env.NEXT_PUBLIC_APP_URL || '');
    else if (kind === 'canceled') t = emailTemplates.subscriptionCanceled(saasName);
    else t = emailTemplates.paymentFailed(saasName);
    await sendEmail({ to: data.email, ...t });
  } catch (e) {
    console.warn('notifyUser skipped', e);
  }
}
