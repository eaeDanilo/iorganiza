import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";
import { PageHeader } from "@/components/imaleta/PageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";

const passos = [
  {
    n: "1",
    title: "Cadastre produtos",
    desc: "Registre seus produtos e gere os códigos de barras para identificá-los.",
    href: "/dashboard/imaleta/produtos",
  },
  {
    n: "2",
    title: "Adicione vendedores",
    desc: "Cadastre os vendedores externos que vão levar as maletas.",
    href: "/dashboard/imaleta/vendedores",
  },
  {
    n: "3",
    title: "Monte a maleta",
    desc: "Selecione os produtos e o vendedor, e registre o período de saída.",
    href: "/dashboard/imaleta/maletas",
  },
  {
    n: "4",
    title: "Faça a conferência",
    desc: "Na volta, bipe os produtos retornados. O que faltar é considerado vendido.",
    href: "/dashboard/imaleta/conferencia",
  },
];

export default async function IMaletaPage() {
  const user = (await getCurrentUser())!;
  const supabase = createIMaletaServiceClient();

  const [
    { count: totalVendedores },
    { count: maletasSemConferencia },
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
      .neq("status", "conferida")
      .is("deleted_at", null),
    supabase
      .from("produtos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null),
  ]);

  const stats = [
    { label: "Vendedores", value: totalVendedores ?? 0, href: "/dashboard/imaleta/vendedores" },
    {
      label: "Maletas sem conferência",
      value: maletasSemConferencia ?? 0,
      href: "/dashboard/imaleta/maletas",
    },
    { label: "Produtos cadastrados", value: totalProdutos ?? 0, href: "/dashboard/imaleta/produtos" },
  ];

  return (
    <div>
      <PageHeader
        title="iMaleta"
        description="Painel de controle de maletas e vendedores externos."
      />

      <div
        className="mb-6 rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          O <span style={{ color: ACCENT }}>iMaleta</span> controla as maletas de produtos que
          você entrega a vendedores externos. Você monta a maleta com os produtos, ela sai com o
          vendedor e, na volta, a conferência aponta o que voltou e o que foi vendido — sem
          planilha e sem contagem manual.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
        <h2 className="mb-4 text-lg font-semibold text-white">Como usar</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {passos.map((p) => (
            <Link
              key={p.n}
              href={p.href}
              className="flex gap-4 rounded-xl p-5 transition-all hover:brightness-110"
              style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid ${BORDER}` }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "rgba(222,218,211,0.1)", color: ACCENT }}
              >
                {p.n}
              </div>
              <div>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {p.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
