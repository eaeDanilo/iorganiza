import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function TrialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/signup?redirect=/trial/${slug}`);
  }

  const supabase = await createSupabaseServerClient();

  const { data: saas } = await supabase
    .from('saas')
    .select('id, trial_enabled, trial_max_uses')
    .eq('slug', slug)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single();

  if (!saas?.trial_enabled) {
    redirect(`/saas/${slug}`);
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('saas_id', saas.id)
    .maybeSingle();

  if (existing) {
    redirect(`/dashboard/${slug}`);
  }

  await supabase.from('subscriptions').insert({
    user_id: user.id,
    saas_id: saas.id,
    status: 'active',
    payment_method: 'manual',
    is_trial: true,
    trial_uses_remaining: saas.trial_max_uses,
  });

  redirect(`/dashboard/${slug}`);
}
