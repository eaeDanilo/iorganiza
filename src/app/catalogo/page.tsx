import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { SaasCard } from '@/components/catalog/SaasCard';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Saas } from '@/types/database';

export const revalidate = 60;

export default async function CatalogoPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('saas')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name');
  const saas = (data ?? []) as Saas[];

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12">
        <div className="container">
          <div className="mb-10">
            <h1 className="text-4xl font-bold">Catálogo</h1>
            <p className="mt-2 text-muted-foreground">Escolha os sistemas que você quer assinar.</p>
          </div>
          {saas.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">Nenhum sistema disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {saas.map((s) => <SaasCard key={s.id} saas={s} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
