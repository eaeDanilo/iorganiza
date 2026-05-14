import { notFound } from 'next/navigation';
import { SaasForm } from '@/components/admin/SaasForm';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { Saas } from '@/types/database';

export default async function EditarSaasPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('saas').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Editar SaaS</h1>
      <SaasForm mode="edit" initial={data as Saas} />
    </div>
  );
}
