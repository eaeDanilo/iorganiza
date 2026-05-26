import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function ICobraLandingPage() {
  const user = await getCurrentUser();

  const ctaHref = user ? '/dashboard/icobra' : '/auth/signup';
  const ctaLabel = user ? 'Acessar painel' : 'Começar agora';

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#07090A] text-white selection:bg-[#00C853]/30">
      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Minimal top bar — full width, no container */}
      <header className="relative z-20 flex shrink-0 items-center justify-between px-8 py-5">
        <Link href="/icobra" className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="5" fill="#00C853" />
            <path d="M6 11.5L9.5 15L16 7" stroke="#07090A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">iCobra</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/" className="text-[13px] text-white/30 transition-colors hover:text-white/60">
            iOrganiza
          </Link>
          {!user && (
            <Link href="/auth/login" className="text-[13px] text-white/50 transition-colors hover:text-white">
              Entrar
            </Link>
          )}
          <Link
            href={ctaHref}
            className="rounded-md bg-[#00C853] px-4 py-1.5 text-[13px] font-semibold text-black transition-all hover:bg-[#1DDB6A] active:scale-[0.97]"
          >
            {ctaLabel}
          </Link>
        </div>
      </header>

      {/* Main split — fills remaining height */}
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* LEFT — copy */}
        <div className="relative z-10 flex w-full flex-col justify-center px-12 pb-10 lg:w-[48%] lg:px-16">
          {/* Green line accent — vertical */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-[#00C853]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#00C853]">
              Gestão de cobranças
            </span>
          </div>

          <h1 className="text-[2.6rem] font-bold leading-[1.1] tracking-[-0.03em] text-white lg:text-[3.2rem]">
            Gerencie empréstimos.
            <br />
            <span className="text-[#00C853]">Não planilhas.</span>
          </h1>

          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/45">
            Veja quem deve, quanto deve e quando paga — tudo em tempo real, sem perder nenhuma cobrança.
          </p>

          {/* Key metrics */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { value: 'R$ 0', label: 'planilhas' },
              { value: '∞', label: 'empréstimos' },
              { value: '100%', label: 'online' },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <p className="text-xl font-bold text-white">{m.value}</p>
                <p className="mt-0.5 text-[11px] text-white/30">{m.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-3">
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-lg bg-[#00C853] px-6 py-3 text-[14px] font-bold text-black transition-all hover:bg-[#1DDB6A] hover:shadow-[0_0_32px_-4px_rgba(0,200,83,0.6)] active:scale-[0.97]"
            >
              {ctaLabel}
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="text-[13px] text-white/40 transition-colors hover:text-white/70"
              >
                Já tenho conta →
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT — mock dashboard */}
        <div className="hidden lg:flex lg:w-[52%] lg:items-center lg:justify-center lg:pr-10">
          {/* Glow behind mock */}
          <div className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#00C853]/6 blur-[100px]" />

          <div
            className="relative w-full max-w-[460px]"
            style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)' }}
          >
            {/* Mock dashboard card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1210] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(0,200,83,0.06)]">
              {/* Window bar */}
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0B0F0C] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="ml-2 text-[11px] text-white/30">iCobra · Painel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00C853]" />
                  <span className="text-[10px] text-[#00C853]">ao vivo</span>
                </div>
              </div>

              <div className="p-5">
                {/* Summary row */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#00C853]/8 p-3.5">
                    <p className="text-[10px] text-white/40">Total emprestado</p>
                    <p className="mt-1 text-xl font-bold text-white">R$ 23.450</p>
                    <p className="mt-0.5 text-[10px] text-[#00C853]">↑ 8% este mês</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-3.5">
                    <p className="text-[10px] text-white/40">Inadimplentes</p>
                    <p className="mt-1 text-xl font-bold text-white">3</p>
                    <p className="mt-0.5 text-[10px] text-orange-400">R$ 2.150 em atraso</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4 rounded-lg bg-white/[0.03] p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] text-white/40">Recebido do total</p>
                    <p className="text-[11px] font-semibold text-white">73%</p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[73%] rounded-full bg-[#00C853]" />
                  </div>
                </div>

                {/* Recent list */}
                <div className="space-y-0.5">
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-white/25">Empréstimos recentes</p>
                  {[
                    { name: 'João Silva', value: 'R$ 1.200', status: 'pago', color: 'text-[#00C853]' },
                    { name: 'Maria Costa', value: 'R$ 800', status: 'atraso', color: 'text-orange-400' },
                    { name: 'Pedro Alves', value: 'R$ 2.000', status: 'pago', color: 'text-[#00C853]' },
                    { name: 'Ana Souza', value: 'R$ 600', status: 'pendente', color: 'text-white/40' },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-md px-2.5 py-2 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-medium text-white/50">
                          {row.name[0]}
                        </div>
                        <span className="text-[12px] text-white/70">{row.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-medium text-white">{row.value}</span>
                        <span className={`text-[10px] ${row.color}`}>{row.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge — bottom right */}
            <div className="absolute -bottom-3 -right-3 rounded-xl border border-[#00C853]/20 bg-[#0D1210] px-4 py-2.5 shadow-lg">
              <p className="text-[10px] text-white/40">próxima cobrança</p>
              <p className="text-[13px] font-semibold text-white">Maria Costa · amanhã</p>
            </div>
          </div>
        </div>

        {/* Diagonal separator line */}
        <div
          className="pointer-events-none absolute inset-y-0 hidden lg:block"
          style={{ left: '47%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(0,200,83,0.08) 30%, rgba(0,200,83,0.08) 70%, transparent)' }}
        />
      </main>

      {/* Bottom bar */}
      <footer className="relative z-10 shrink-0 flex items-center justify-between px-8 py-4">
        <p className="text-[11px] text-white/20">
          © 2025 iCobra ·{' '}
          <Link href="/" className="text-white/30 transition-colors hover:text-white/50">
            iOrganiza
          </Link>
        </p>
        <p className="text-[11px] text-white/20">Gestão de cobranças e empréstimos</p>
      </footer>
    </div>
  );
}
