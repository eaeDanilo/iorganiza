import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Maleta, Produto, Vendedor } from "@/lib/imaleta/types";
import { MaletasUI } from "./MaletasUI";

export const dynamic = "force-dynamic";

export default async function MaletasPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();

  const [{ data: maletas }, { data: vendedores }, { data: produtos }] = await Promise.all([
    supabase
      .from("maletas")
      .select("*, vendedores(nome)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("vendedores")
      .select("id, nome")
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("nome"),
    supabase
      .from("produtos")
      .select("id, nome, codigo_barras, preco, imagem_url")
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("nome"),
  ]);

  return (
    <div>
      <PageHeader
        title="Maletas"
        description="Monte maletas para seus vendedores e acompanhe o status."
      />
      <MaletasUI
        initial={(maletas as Maleta[]) ?? []}
        vendedores={(vendedores as Pick<Vendedor, "id" | "nome">[]) ?? []}
        produtos={(produtos as Pick<Produto, "id" | "nome" | "codigo_barras" | "preco" | "imagem_url">[]) ?? []}
      />
    </div>
  );
}
