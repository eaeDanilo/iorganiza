import { SaasCard } from '@/components/catalog/SaasCard';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Saas, Subscription } from '@/types/database';

export default async function DashboardCatalogoPage() {
  const user = (await getCurrentUser())!;
  const supabase = createSupabaseServerClient();
  const [{ data: saas }, { data: subs }] = await Promise.all([
    supabase.from('saas').select('*').eq('status', 'active').is('deleted_at', null).order('name'),
    supabase.from('subscriptions').select('saas_id, status').eq('user_id', user.id),
  ]);
  const ownedIds = new Set((subs as Pick<Subscription, 'saas_id' | 'status'>[] ?? [])
    .filter((s) => s.status === 'active' || s.status === 'pending')
    .map((s) => s.saas_id));
  const list = (saas ?? []) as Saas[];
  const available = list.filter((s) => !ownedIds.has(s.id));
  const owned = list.filter((s) => ownedIds.has(s.id));

  return (
    <div>
      <h1 className="text-3xl font-bold">Catálogo</h1>
      <p className="mt-1 text-muted-foreground">Explore novos sistemas para adicionar à sua conta.</p>

      {available.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Disponíveis para você</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {available.map((s) => <SaasCard key={s.id} saas={s} />)}
          </div>
        </section>
      )}

      {owned.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-muted-foreground">Você já assina</h2>
          <div className="grid grid-cols-1 gap-6 opacity-60 md:grid-cols-2 lg:grid-cols-3">
            {owned.map((s) => <SaasCard key={s.id} saas={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
