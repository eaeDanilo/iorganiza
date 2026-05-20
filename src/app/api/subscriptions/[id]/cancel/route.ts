export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError } from '@/lib/api';
import { getStripe } from '@/lib/stripe';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServiceClient();
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!sub) {
      return NextResponse.redirect(new URL('/dashboard/meus-saas', _req.url));
    }
    if (sub.payment_method === 'stripe' && sub.stripe_subscription_id) {
      try {
        await getStripe().subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
      } catch (e) {
        console.warn('Stripe cancel error', e);
      }
    }
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', cancel_at: new Date().toISOString() })
      .eq('id', params.id);
    return NextResponse.redirect(new URL('/dashboard/meus-saas', _req.url));
  } catch (e) { return handleError(e); }
}
