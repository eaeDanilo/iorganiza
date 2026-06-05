import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Vendedor } from "@/lib/imaleta/types";
import { VendedoresUI } from "./VendedoresUI";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();
  const { data } = await supabase
    .from("vendedores")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader title="Vendedores" description="Cadastre os vendedores externos da sua loja." />
      <VendedoresUI initial={(data as Vendedor[]) ?? []} />
    </div>
  );
}
