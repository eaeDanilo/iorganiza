import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';
import { formatCurrency, getAppUrl } from '@/lib/utils';
import type { Saas, SaasPlan, Subscription } from '@/types/database';

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: 'Este produto ainda não está disponível para compra. Tente novamente em breve.',
  stripe_error: 'Erro ao iniciar pagamento. Tente novamente ou entre em contato com o suporte.',
  invalid_plan: 'Plano inválido. Selecione um plano disponível.',
};

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { saasId: string };
  searchParams: { error?: string; canceled?: string; plan?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?redirect=/checkout/${params.saasId}`);

  const supabase = createSupabaseServerClient();
  const { data: saasData } = await supabase.from('saas').select('*').eq('id', params.saasId).maybeSingle();
  const saas = saasData as Saas | null;
  if (!saas) notFound();
  if (saas.status !== 'active') redirect('/catalogo');

  // Load plans for this SaaS
  const { data: plansData } = await supabase
    .from('saas_plans')
    .select('*')
    .eq('saas_id', saas.id)
    .order('sort_order', { ascending: true });
  const plans = (plansData ?? []) as SaasPlan[];

  // Resolve selected plan
  let selectedPlan: SaasPlan | null = null;
  if (plans.length > 0) {
    if (searchParams.plan) {
      selectedPlan = plans.find((p) => p.id === searchParams.plan) ?? null;
      if (!selectedPlan) redirect(`/checkout/${saas.id}?error=invalid_plan`);
    } else {
      selectedPlan = plans.find((p) => p.is_default) ?? plans[0];
      redirect(`/checkout/${saas.id}?plan=${selectedPlan.id}`);
    }
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('saas_id', saas.id)
    .maybeSingle();
  const existingSub = existing as Pick<Subscription, 'id' | 'status'> | null;

  const errorMsg = searchParams.error ? (ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.stripe_error) : null;

  const displayPrice = selectedPlan?.price_monthly ?? saas.price_monthly;
  const displayFeatures = selectedPlan?.features ?? saas.features;
  const stripePrice = selectedPlan?.stripe_price_id ?? saas.stripe_price_id;

  async function startCheckout() {
    'use server';
    if (!stripePrice) {
      redirect(`/checkout/${saas!.id}${selectedPlan ? `?plan=${selectedPlan.id}&` : '?'}error=not_configured`);
    }
    let sessionUrl: string | null = null;
    try {
      const session = await createCheckoutSession({
        priceId: stripePrice!,
        customerEmail: user!.email,
        successUrl: `${getAppUrl()}/dashboard?checkout=success&saas=${saas!.slug}`,
        cancelUrl: `${getAppUrl()}/checkout/${saas!.id}${selectedPlan ? `?plan=${selectedPlan.id}&` : '?'}canceled=1`,
        metadata: {
          user_id: user!.id,
          saas_id: saas!.id,
          ...(selectedPlan ? { plan_id: selectedPlan.id } : {}),
        },
      });
      sessionUrl = session.url;
    } catch {
      // sessionUrl stays null
    }
    if (!sessionUrl) {
      redirect(`/checkout/${saas!.id}${selectedPlan ? `?plan=${selectedPlan.id}&` : '?'}error=stripe_error`);
    }
    redirect(sessionUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            Assinar {saas.name}
            {selectedPlan && (
              <span className="ml-2 text-base font-normal text-muted-foreground">— {selectedPlan.name}</span>
            )}
          </CardTitle>
          {plans.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {plans.map((p) => (
                <a
                  key={p.id}
                  href={`/checkout/${saas.id}?plan=${p.id}`}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    p.id === selectedPlan?.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {p.name}
                </a>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {existingSub && (existingSub.status === 'active' || existingSub.status === 'pending') && (
            <div className="mb-4 rounded-md border border-success bg-success/10 p-3 text-sm">
              Você já possui assinatura ({existingSub.status}). Gerencie em Faturamento.
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          {searchParams.canceled && !errorMsg && (
            <div className="mb-4 rounded-md border border-border bg-surface p-3 text-sm text-muted-foreground">
              Pagamento cancelado. Você pode tentar novamente quando quiser.
            </div>
          )}
          <p className="mb-2 text-muted-foreground">{selectedPlan?.description ?? saas.description}</p>
          <div className="my-6 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatCurrency(displayPrice)}</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          {Array.isArray(displayFeatures) && displayFeatures.length > 0 && (
            <ul className="mb-6 space-y-2 text-sm">
              {displayFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
              {selectedPlan?.has_ai_chat && (
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-primary">✦</span> Assistente IA incluso
                </li>
              )}
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
