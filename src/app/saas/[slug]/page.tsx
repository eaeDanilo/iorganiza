import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import type { Saas, SaasPlan } from '@/types/database';

export default async function SaasDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from('saas')
    .select('*')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle();
  const saas = data as Saas | null;
  if (!saas) notFound();

  const { data: plansData } = await supabase
    .from('saas_plans')
    .select('*')
    .eq('saas_id', saas.id)
    .order('sort_order', { ascending: true });
  const plans = (plansData ?? []) as SaasPlan[];

  const { data: { user } } = await supabase.auth.getUser();

  let hasActiveSub = false;
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('saas_id', saas.id)
      .eq('status', 'active')
      .maybeSingle();
    hasActiveSub = !!sub;
  }

  const isActive = saas.status === 'active';
  const trialLoginUrl = `/auth/login?redirect=/dashboard/${saas.slug}`;
  const dashboardUrl = `/dashboard/${saas.slug}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section
          className="border-b border-border bg-gradient-to-br from-primary/30 via-background to-secondary/20 py-20"
          style={saas.banner_url ? { backgroundImage: `url(${saas.banner_url})`, backgroundSize: 'cover' } : undefined}
        >
          <div className="container">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-bold">{saas.name}</h1>
              {!isActive && <Badge variant="outline">Em breve</Badge>}
            </div>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{saas.description}</p>

            {saas.trial_enabled && isActive && (
              <p className="mt-2 text-sm text-muted-foreground">
                Teste grátis com até <strong>{saas.trial_max_uses} uso{saas.trial_max_uses !== 1 ? 's' : ''}</strong> — sem cartão de crédito.
              </p>
            )}

            {plans.length === 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-4xl font-bold">{formatCurrency(saas.price_monthly)}</p>
                  <p className="text-sm text-muted-foreground">por mês</p>
                </div>

                {hasActiveSub ? (
                  <Button asChild size="lg">
                    <Link href={dashboardUrl}>Acessar</Link>
                  </Button>
                ) : (
                  <>
                    {saas.trial_enabled && isActive && (
                      <Button asChild size="lg" variant="outline">
                        <Link href={user ? dashboardUrl : trialLoginUrl}>
                          Testar grátis
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="lg" disabled={!isActive}>
                      <Link href={`/checkout/${saas.id}`}>Assinar agora</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {plans.length > 0 && (
          <section className="py-16 border-b border-border">
            <div className="container max-w-4xl">
              <h2 className="mb-2 text-2xl font-bold text-center">Escolha seu plano</h2>
              <p className="mb-10 text-center text-muted-foreground">
                {hasActiveSub ? 'Você já possui uma assinatura ativa.' : 'Selecione o plano ideal para sua necessidade.'}
              </p>
              <div className={`grid gap-6 ${plans.length === 2 ? 'md:grid-cols-2' : plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-1 max-w-sm mx-auto'}`}>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-xl border p-6 ${
                      plan.has_ai_chat
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card'
                    }`}
                  >
                    {plan.has_ai_chat && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="px-3 py-1 text-xs font-semibold">Mais popular</Badge>
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      {plan.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                      )}
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{formatCurrency(plan.price_monthly)}</span>
                      <span className="ml-1 text-muted-foreground">/mês</span>
                    </div>
                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <ul className="mb-6 flex-1 space-y-2 text-sm">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 text-success">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                        {plan.has_ai_chat && (
                          <li className="flex items-start gap-2 font-medium">
                            <span className="mt-0.5 text-primary">✦</span>
                            <span>Assistente IA incluso</span>
                          </li>
                        )}
                      </ul>
                    )}
                    {hasActiveSub ? (
                      <Button asChild size="lg" variant={plan.has_ai_chat ? 'default' : 'outline'}>
                        <Link href={dashboardUrl}>Acessar</Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="lg"
                        variant={plan.has_ai_chat ? 'default' : 'outline'}
                        disabled={!isActive}
                      >
                        <Link href={`/checkout/${saas.id}?plan=${plan.id}`}>
                          Assinar {plan.name}
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {saas.trial_enabled && isActive && !hasActiveSub && (
                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Prefere experimentar antes?{' '}
                  <Link href={user ? dashboardUrl : trialLoginUrl} className="underline underline-offset-2">
                    Teste grátis com até {saas.trial_max_uses} uso{saas.trial_max_uses !== 1 ? 's' : ''}
                  </Link>
                </p>
              )}
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold">O que está incluído</h2>
            {Array.isArray(saas.features) && saas.features.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {saas.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                    <span className="mt-0.5 text-success">✓</span>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Lista de funcionalidades não disponível.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
