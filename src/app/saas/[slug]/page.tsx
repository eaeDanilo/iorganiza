import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import type { Saas } from '@/types/database';

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
              {saas.status === 'inactive' && <Badge variant="outline">Em breve</Badge>}
            </div>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{saas.description}</p>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="text-4xl font-bold">{formatCurrency(saas.price_monthly)}</p>
                <p className="text-sm text-muted-foreground">por mês</p>
              </div>
              <Button asChild size="lg" disabled={saas.status !== 'active'}>
                <Link href={`/checkout/${saas.id}`}>Assinar agora</Link>
              </Button>
            </div>
          </div>
        </section>

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
              <p className="text-muted-foreground">Lista de features não disponível.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
