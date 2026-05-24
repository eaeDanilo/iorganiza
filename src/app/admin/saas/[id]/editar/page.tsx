import { notFound } from 'next/navigation';
import { SaasForm } from '@/components/admin/SaasForm';
import { SaasPlansManager } from '@/components/admin/SaasPlansManager';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { Saas, SaasPlan } from '@/types/database';

export default async function EditarSaasPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('saas').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();

  const { data: plansData } = await supabase
    .from('saas_plans')
    .select('*')
    .eq('saas_id', params.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 text-3xl font-bold">Editar Sistema</h1>
        <SaasForm mode="edit" initial={data as Saas} />
      </div>
      <div>
        <SaasPlansManager saasId={params.id} initialPlans={(plansData ?? []) as SaasPlan[]} />
      </div>
    </div>
  );
}
