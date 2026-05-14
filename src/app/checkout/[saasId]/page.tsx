import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';
import { formatCurrency, getAppUrl } from '@/lib/utils';
import type { Saas, Subscription } from '@/types/database';

export default async function CheckoutPage({ params }: { params: { saasId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?redirect=/checkout/${params.saasId}`);

  const supabase = createSupabaseServerClient();
  const { data: saasData } = await supabase.from('saas').select('*').eq('id', params.saasId).maybeSingle();
  const saas = saasData as Saas | null;
  if (!saas) notFound();
  if (saas.status !== 'active') redirect('/catalogo');

  // Check existing subscription
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('saas_id', saas.id)
    .maybeSingle();
  const existingSub = existing as Pick<Subscription, 'id' | 'status'> | null;

  async function startCheckout() {
    'use server';
    if (!saas!.stripe_price_id) {
      throw new Error('SaaS sem stripe_price_id configurado.');
    }
    const session = await createCheckoutSession({
      priceId: saas!.stripe_price_id,
      customerEmail: user!.email,
      successUrl: `${getAppUrl()}/dashboard?checkout=success&saas=${saas!.slug}`,
      cancelUrl: `${getAppUrl()}/checkout/${saas!.id}?canceled=1`,
      metadata: { user_id: user!.id, saas_id: saas!.id },
    });
    redirect(session.url!);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Assinar {saas.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {existingSub && (existingSub.status === 'active' || existingSub.status === 'pending') && (
            <div className="mb-4 rounded-md border border-success bg-success/10 p-3 text-sm">
              Você já possui assinatura ({existingSub.status}). Gerencie em Faturamento.
            </div>
          )}
          <p className="mb-2 text-muted-foreground">{saas.description}</p>
          <div className="my-6 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatCurrency(saas.price_monthly)}</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          {Array.isArray(saas.features) && saas.features.length > 0 && (
            <ul className="mb-6 space-y-2 text-sm">
              {saas.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
          )}
          <form action={startCheckout}>
            <Button type="submit" size="lg" className="w-full">
              Pagar com Stripe
            </Button>
          </form>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Cobrança recorrente mensal. Cancele quando quiser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
