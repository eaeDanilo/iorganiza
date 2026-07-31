import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { signProdutos } from "@/lib/imaleta/images";
import { buscarAlocacoesAtivas } from "@/lib/imaleta/alocacoes";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Produto } from "@/lib/imaleta/types";
import { ProdutosUI } from "./ProdutosUI";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();
  const [{ data }, alocacoes] = await Promise.all([
    supabase
      .from("produtos")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    buscarAlocacoesAtivas(supabase, user.id),
  ]);

  const produtos = await signProdutos((data as Produto[]) ?? []);

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastre produtos e gere códigos de barras para imprimir."
      />
      <ProdutosUI initial={produtos} alocacoes={alocacoes} />
    </div>
  );
}
