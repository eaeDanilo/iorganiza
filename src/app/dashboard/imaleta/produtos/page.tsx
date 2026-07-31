import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { signProdutos } from "@/lib/imaleta/images";
import { buscarAlocacoesAtivas } from "@/lib/imaleta/alocacoes";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Produto } from "@/lib/imaleta/types";
import { ProdutosUI } from "./ProdutosUI";

export const dynamic = "force-dynamic";

const VENDIDOS_DIAS = 3;

export default async function ProdutosPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();
  const cutoff = new Date(Date.now() - VENDIDOS_DIAS * 24 * 60 * 60 * 1000).toISOString();

  const [{ data }, { data: vendidosData }, alocacoes] = await Promise.all([
    supabase
      .from("produtos")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("produtos")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "inactive")
      .is("deleted_at", null)
      .gte("updated_at", cutoff)
      .order("updated_at", { ascending: false }),
    buscarAlocacoesAtivas(supabase, user.id),
  ]);

  const [produtos, vendidos] = await Promise.all([
    signProdutos((data as Produto[]) ?? []),
    signProdutos((vendidosData as Produto[]) ?? []),
  ]);

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastre produtos e gere códigos de barras para imprimir."
      />
      <ProdutosUI initial={produtos} vendidos={vendidos} alocacoes={alocacoes} />
    </div>
  );
}
