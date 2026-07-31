import "server-only";
import type { createIMaletaServiceClient } from "./supabase";

export interface Alocacao {
  maletaId: string;
  maletaNome: string;
  vendedorNome: string;
}

/**
 * Mapeia produto_id -> maleta aberta (status != 'conferida') que o contém.
 * Usado para avisar/bloquear um produto sendo colocado em duas maletas ao mesmo tempo.
 */
export async function buscarAlocacoesAtivas(
  supabase: ReturnType<typeof createIMaletaServiceClient>,
  userId: string
): Promise<Record<string, Alocacao>> {
  const { data: maletas } = await supabase
    .from("maletas")
    .select("id, nome, vendedores(nome)")
    .eq("user_id", userId)
    .neq("status", "conferida")
    .is("deleted_at", null);

  if (!maletas || maletas.length === 0) return {};

  const { data: itens } = await supabase
    .from("maleta_items")
    .select("produto_id, maleta_id")
    .in("maleta_id", maletas.map((m) => m.id));

  const maletaById = new Map(maletas.map((m) => [m.id, m]));
  const result: Record<string, Alocacao> = {};
  for (const item of itens ?? []) {
    const m = maletaById.get(item.maleta_id);
    if (!m) continue;
    result[item.produto_id] = {
      maletaId: m.id,
      maletaNome: m.nome,
      vendedorNome: (m as any).vendedores?.nome ?? "—",
    };
  }
  return result;
}
