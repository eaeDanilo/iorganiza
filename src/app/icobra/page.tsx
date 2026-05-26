import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function ICobraLandingPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? '/dashboard/icobra' : '/auth/signup';

  return (
    <div
      className="min-h-screen bg-[#F2EDE4] text-[#0C0C0C]"
      style={{ fontFamily: 'var(--font-mono-dm, monospace)' }}
    >
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between border-b-2 border-[#0C0C0C] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-[#00C853]">
            <span
              className="text-[15px] font-normal leading-none text-[#0C0C0C]"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              iC
            </span>
          </div>
          <span
            className="text-2xl leading-none tracking-wide text-[#0C0C0C]"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            iCobra
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-xs text-[#0C0C0C]/40 hover:text-[#0C0C0C]/70 transition-colors">
            ← iOrganiza
          </Link>
          {!user && (
            <Link href="/auth/login" className="text-xs text-[#0C0C0C]/60 hover:text-[#0C0C0C] transition-colors">
              entrar
            </Link>
          )}
          <Link
            href={ctaHref}
            className="border-2 border-[#0C0C0C] bg-[#0C0C0C] px-5 py-2 text-xs font-medium text-[#F2EDE4] transition-all hover:bg-[#00C853] hover:text-[#0C0C0C] hover:border-[#00C853]"
          >
            {user ? 'Acessar painel' : 'Começar agora'} →
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-[#0C0C0C]">
        {/* Big background word */}
        <div
          className="pointer-events-none absolute -bottom-8 left-0 select-none leading-none text-[#0C0C0C]/[0.04]"
          style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(120px, 22vw, 320px)' }}
          aria-hidden
        >
          COBRAR
        </div>

        <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-[1fr_420px]">
          {/* Left — headline */}
          <div className="flex flex-col justify-between border-r-0 border-[#0C0C0C] p-8 lg:border-r-2 lg:p-14">
            <div>
              {/* Tag */}
              <div className="mb-10 inline-flex items-center gap-2 border border-[#0C0C0C]/20 px-3 py-1.5">
                <div className="h-2 w-2 bg-[#00C853]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#0C0C0C]/60">
                  Gestão de empréstimos
                </span>
              </div>

              {/* Display headline */}
              <h1
                className="leading-none text-[#0C0C0C]"
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: 'clamp(72px, 10vw, 130px)',
                  letterSpacing: '0.01em',
                }}
              >
                Gerencie
                <br />
                quem deve.
                <br />
                <span
                  className="relative inline-block"
                  style={{ WebkitTextStroke: '2px #0C0C0C', color: 'transparent' }}
                >
                  Cobre de verdade.
                </span>
              </h1>

              <p className="mt-8 max-w-md text-[13px] leading-relaxed text-[#0C0C0C]/55">
                Chega de planilha. iCobra mostra quem deve, quanto deve
                e quando vence — em tempo real, sem complicação.
              </p>
            </div>

            {/* Bottom row */}
            <div className="mt-12 flex flex-wrap items-end gap-6">
              <Link
                href={ctaHref}
                className="group inline-flex items-center gap-3 bg-[#00C853] px-8 py-4 text-sm font-medium text-[#0C0C0C] transition-all hover:bg-[#0C0C0C] hover:text-[#F2EDE4]"
              >
                <span>{user ? 'Acessar painel' : 'Começar grátis'}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              {!user && (
                <Link
                  href="/auth/login"
                  className="border-b border-[#0C0C0C]/30 pb-0.5 text-xs text-[#0C0C0C]/50 hover:border-[#0C0C0C] hover:text-[#0C0C0C] transition-colors"
                >
                  Já tenho conta
                </Link>
              )}
            </div>
          </div>

          {/* Right — data panel */}
          <div className="flex flex-col divide-y-2 divide-[#0C0C0C] border-t-2 border-[#0C0C0C] lg:border-t-0">
            {/* Block 1 — total */}
            <div className="bg-[#00C853] p-6">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#0C0C0C]/60">
                Total emprestado
              </p>
              <p
                className="mt-1 leading-none text-[#0C0C0C]"
                style={{ fontFamily: 'var(--font-bebas)', fontSize: '52px' }}
              >
                R$ 23.450,00
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1 flex-1 bg-[#0C0C0C]/10">
                  <div className="h-full w-[73%] bg-[#0C0C0C]" />
                </div>
                <span className="text-[10px] text-[#0C0C0C]/60">73% recebido</span>
              </div>
            </div>

            {/* Block 2 — inadimplentes */}
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#0C0C0C]/50">
                Inadimplentes
              </p>
              <p
                className="mt-1 leading-none"
                style={{ fontFamily: 'var(--font-bebas)', fontSize: '52px' }}
              >
                3
              </p>
              <p className="mt-1 text-[11px] text-[#0C0C0C]/50">R$ 2.150 em atraso</p>
            </div>

            {/* Block 3 — list */}
            <div className="flex-1 p-6">
              <p className="mb-4 text-[10px] uppercase tracking-[0.15em] text-[#0C0C0C]/40">
                Empréstimos ativos
              </p>
              <div className="space-y-0">
                {[
                  { name: 'João Silva', val: 'R$ 1.200', status: 'PAGO', ok: true },
                  { name: 'Maria Costa', val: 'R$ 800', status: 'ATRASO', ok: false },
                  { name: 'Pedro Alves', val: 'R$ 2.000', status: 'PAGO', ok: true },
                  { name: 'Ana Souza', val: 'R$ 600', status: 'PENDENTE', ok: null },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[#0C0C0C]/10 py-3 last:border-0"
                  >
                    <span className="text-[12px] text-[#0C0C0C]/70">{r.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-medium">{r.val}</span>
                      <span
                        className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5"
                        style={{
                          background: r.ok === true ? '#00C853' : r.ok === false ? '#FF3B30' : '#0C0C0C10',
                          color: r.ok === true ? '#0C0C0C' : r.ok === false ? '#fff' : '#0C0C0C80',
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Block 4 — próxima */}
            <div className="bg-[#0C0C0C] p-5 text-[#F2EDE4]">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#F2EDE4]/40">
                Próxima cobrança
              </p>
              <p className="mt-1 text-[13px]">
                Maria Costa{' '}
                <span className="text-[#00C853]">amanhã · R$ 266,67</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-6 py-4">
        <p className="text-[10px] text-[#0C0C0C]/30">© 2025 iCobra</p>
        <p className="text-[10px] text-[#0C0C0C]/30">
          Parte do{' '}
          <Link href="/" className="text-[#0C0C0C]/50 hover:text-[#0C0C0C] transition-colors underline underline-offset-2">
            ecossistema iOrganiza
          </Link>
        </p>
      </footer>
    </div>
  );
}
