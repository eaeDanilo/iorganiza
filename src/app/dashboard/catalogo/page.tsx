import { SaasCard } from '@/components/catalog/SaasCard';
import { ICobraBanner } from '@/components/catalog/ICobraBanner';
import { IMaletaBanner } from '@/components/catalog/IMaletaBanner';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Saas, Subscription } from '@/types/database';

export default async function DashboardCatalogoPage() {
  const user = (await getCurrentUser())!;
  const supabase = await createSupabaseServerClient();
  const [{ data: saas }, { data: subs }] = await Promise.all([
    supabase.from('saas').select('*').eq('status', 'active').is('deleted_at', null).order('name'),
    supabase.from('subscriptions').select('saas_id, status, saas:saas(slug)').eq('user_id', user.id),
  ]);
  type SubRow = Pick<Subscription, 'saas_id' | 'status'> & { saas: { slug: string } | null };
  const subList = ((subs as unknown as SubRow[]) ?? []).filter((s) => s.status === 'active' || s.status === 'pending');
  const ownedIds = new Set(subList.map((s) => s.saas_id));
  const ownedSlugs = new Set(subList.map((s) => s.saas?.slug).filter(Boolean) as string[]);
  const list = (saas ?? []) as Saas[];
  const icobraSaas = list.find((s) => s.slug === 'icobra');
  const imaletaSaas = list.find((s) => s.slug === 'imaleta');
  const available = list.filter((s) => !ownedIds.has(s.id));
  const owned = list.filter((s) => ownedIds.has(s.id));

  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Catálogo</h1>
      <p className="mt-1 text-muted-foreground">Explore novos sistemas para adicionar à sua conta.</p>

      <div className="mt-6">
        <ICobraBanner hasAccess={ownedSlugs.has('icobra')} trialEnabled={icobraSaas?.trial_enabled ?? false} />
        <IMaletaBanner hasAccess={ownedSlugs.has('imaleta')} trialEnabled={imaletaSaas?.trial_enabled ?? false} />
      </div>

      {available.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold sm:text-xl">Disponíveis para você</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {available.map((s) => <SaasCard key={s.id} saas={s} hasAccess={false} />)}
          </div>
        </section>
      )}

      {owned.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground sm:text-xl">Você já assina</h2>
          <div className="grid grid-cols-1 gap-4 opacity-60 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {owned.map((s) => <SaasCard key={s.id} saas={s} hasAccess={true} />)}
          </div>
        </section>
      )}
    </div>
  );
}
