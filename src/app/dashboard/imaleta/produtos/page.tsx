import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Produto } from "@/lib/imaleta/types";
import { ProdutosUI } from "./ProdutosUI";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("nome");

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastre produtos e gere códigos de barras para imprimir."
      />
      <ProdutosUI initial={(data as Produto[]) ?? []} />
    </div>
  );
}
