import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import type { Maleta, Conferencia } from "@/lib/imaleta/types";
import { ConferenciaUI } from "./ConferenciaUI";
import { HistoricoConferencias } from "./HistoricoConferencias";

export const dynamic = "force-dynamic";

export default async function ConferenciaPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();

  const [{ data: maletas }, { data: conferencias }, { data: historico }] =
    await Promise.all([
      supabase
        .from("maletas")
        .select("*, vendedores(nome)")
        .eq("user_id", user.id)
        .in("status", ["aberta", "em_conferencia"])
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("conferencias")
        .select("*, maletas(nome, periodo_inicio, periodo_fim, vendedores(nome))")
        .eq("user_id", user.id)
        .eq("status", "em_andamento")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("conferencias")
        .select("*, maletas(nome, periodo_inicio, periodo_fim, vendedores(nome))")
        .eq("user_id", user.id)
        .eq("status", "finalizada")
        .is("deleted_at", null)
        .order("finalizada_at", { ascending: false })
        .limit(50),
    ]);

  return (
    <div className="space-y-8">
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

      <div>
        <p
          className="mb-4 text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Histórico de conferências
        </p>
        <HistoricoConferencias historico={(historico as Conferencia[]) ?? []} />
      </div>
    </div>
  );
}
