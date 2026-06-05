import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";

export default async function IMaletaPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();

  const [
    { count: totalVendedores },
    { count: maletasAbertas },
    { count: confPendentes },
    { count: totalProdutos },
  ] = await Promise.all([
    supabase
      .from("vendedores")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("maletas")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "aberta")
      .is("deleted_at", null),
    supabase
      .from("conferencias")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "em_andamento"),
    supabase
      .from("produtos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null),
  ]);

  const stats = [
    { label: "Vendedores", value: totalVendedores ?? 0, href: "/dashboard/imaleta/vendedores" },
    { label: "Maletas abertas", value: maletasAbertas ?? 0, href: "/dashboard/imaleta/maletas" },
    {
      label: "Conferências pendentes",
      value: confPendentes ?? 0,
      href: "/dashboard/imaleta/conferencia",
    },
    { label: "Produtos cadastrados", value: totalProdutos ?? 0, href: "/dashboard/imaleta/produtos" },
  ];

  const { data: ultimasMaletas } = await supabase
    .from("maletas")
    .select("id, nome, status, periodo_inicio, vendedores(nome)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const statusLabel: Record<string, string> = {
    aberta: "Aberta",
    em_conferencia: "Em conferência",
    conferida: "Conferida",
  };

  const statusColor: Record<string, string> = {
    aberta: "#DEDAD3",
    em_conferencia: "#F59E0B",
    conferida: "rgba(222,218,211,0.35)",
  };

  return (
    <div>
      <PageHeader
        title="iMaleta"
        description="Painel de controle de maletas e vendedores externos."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-xl p-4 transition-all hover:brightness-110 sm:p-5"
            style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid ${BORDER}` }}
          >
            <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Últimas maletas</h2>
        {!ultimasMaletas || ultimasMaletas.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}
          >
            <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhuma maleta criada ainda.</p>
            <Link
              href="/dashboard/imaleta/maletas"
              className="mt-3 inline-flex items-center text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: ACCENT }}
            >
              Criar primeira maleta →
            </Link>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-xl"
            style={{ outline: `1px solid ${BORDER}` }}
          >
            {(ultimasMaletas as any[]).map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-5 py-3.5"
                style={{
                  borderTop: i > 0 ? `1px solid ${BORDER}` : undefined,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{m.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {m.vendedores?.nome} · {m.periodo_inicio}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: "rgba(222,218,211,0.08)",
                    color: statusColor[m.status] ?? ACCENT,
                  }}
                >
                  {statusLabel[m.status] ?? m.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            href: "/dashboard/imaleta/maletas",
            title: "Maletas",
            desc: "Monte e gerencie maletas de vendedores.",
          },
          {
            href: "/dashboard/imaleta/conferencia",
            title: "Conferência",
            desc: "Bipe os produtos retornados e veja o que foi vendido.",
          },
          {
            href: "/dashboard/imaleta/produtos",
            title: "Produtos",
            desc: "Cadastre produtos e gere códigos de barras.",
          },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl p-5 transition-all hover:brightness-110"
            style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid ${BORDER}` }}
          >
            <div className="mb-2 h-0.5 w-6 rounded-full" style={{ background: ACCENT }} />
            <p className="font-semibold text-white">{c.title}</p>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {c.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
