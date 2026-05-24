import { SaasForm } from '@/components/admin/SaasForm';

export default function NovoSaasPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Novo Sistema</h1>
      <SaasForm mode="create" />
    </div>
  );
}
