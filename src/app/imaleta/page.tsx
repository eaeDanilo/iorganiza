import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const BG = "#181818";
const ACCENT = "#DEDAD3";

export default async function IMaletaLandingPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/dashboard/imaleta" : "/auth/signup";

  return (
    <div className="min-h-screen text-white" style={{ background: BG }}>
      {/* NAV */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: ACCENT }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="7" width="16" height="11" rx="2" stroke={BG} strokeWidth="2.2" />
              <path
                d="M7 7V5a3 3 0 016 0v2"
                stroke={BG}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">iMaleta</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            iOrganiza
          </Link>
          {!user ? (
            <>
              <Link
                href="/auth/login?redirect=/dashboard/imaleta"
                className="text-sm transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:brightness-95"
                style={{ background: ACCENT, color: BG }}
              >
                Começar grátis
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard/imaleta"
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:brightness-95"
              style={{ background: ACCENT, color: BG }}
            >
              Acessar painel
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(222,218,211,0.08)",
            outline: "1px solid rgba(222,218,211,0.15)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
          <span className="text-xs font-semibold" style={{ color: ACCENT }}>
            Gestão de maletas de vendas
          </span>
        </div>

        <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-[-0.02em] text-white md:text-6xl">
          Controle suas
          <br />
          maletas.
          <br />
          <span style={{ color: ACCENT }}>Sem planilha.</span>
        </h1>

        <p
          className="mt-6 max-w-lg text-lg leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Monte maletas para seus vendedores externos, bipe os produtos e saiba exatamente o que
          foi vendido ao retorno.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href={ctaHref}
            className="rounded-lg px-6 py-3 text-[15px] font-semibold transition-colors hover:brightness-95"
            style={{ background: ACCENT, color: BG }}
          >
            {user ? "Acessar painel" : "Começar grátis"}
          </Link>
          {!user && (
            <Link
              href="/auth/login?redirect=/dashboard/imaleta"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Já tenho conta →
            </Link>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Monte maletas",
              desc: "Registre quais produtos estão em cada maleta antes do vendedor sair.",
            },
            {
              title: "Bipe o retorno",
              desc: "Na conferência, bipe os produtos retornados pela câmera ou leitor USB.",
            },
            {
              title: "Veja o resultado",
              desc: "O sistema calcula automaticamente o que foi vendido no período.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                outline: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="mb-3 h-1 w-8 rounded-full" style={{ background: ACCENT }} />
              <p className="font-semibold text-white">{f.title}</p>
              <p
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer
        className="mx-auto max-w-5xl px-6 py-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          © 2025 iMaleta · Parte do{" "}
          <Link
            href="/"
            className="underline underline-offset-2 transition-colors hover:text-white/60"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            ecossistema iOrganiza
          </Link>
        </p>
      </footer>
    </div>
  );
}
