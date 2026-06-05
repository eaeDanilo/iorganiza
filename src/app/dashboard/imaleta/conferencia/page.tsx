import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Maleta, Conferencia, MaletaItem } from "@/lib/imaleta/types";
import { ConferenciaUI } from "./ConferenciaUI";

export const dynamic = "force-dynamic";

export default async function ConferenciaPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();

  const [{ data: maletas }, { data: conferencias }] = await Promise.all([
    supabase
      .from("maletas")
      .select("*, vendedores(nome)")
      .eq("user_id", user.id)
      .in("status", ["aberta", "em_conferencia"])
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("conferencias")
      .select("*, maletas(nome, vendedores(nome))")
      .eq("user_id", user.id)
      .eq("status", "em_andamento")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        title="Conferência"
        description="Bipe os produtos retornados e calcule o que foi vendido."
      />
      <ConferenciaUI
        maletas={(maletas as Maleta[]) ?? []}
        conferenciasPendentes={(conferencias as Conferencia[]) ?? []}
      />
    </div>
  );
}
