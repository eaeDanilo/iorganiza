import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'iCobra — Gestão de cobranças e empréstimos',
  description: 'Controle empréstimos, parcelas e inadimplentes em um único lugar. Simples, rápido e confiável.',
};

export default async function ICobraLandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#040A04] text-[#F0F4F0]" style={{ fontFamily: 'var(--font-jakarta)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#00C853]/10 bg-[#040A04]/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/icobra" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00C853]">
              <span className="text-[11px] font-black leading-none text-black">iC</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">iCobra</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-[#F0F4F0]/40 transition-colors hover:text-[#F0F4F0]/70"
            >
              iOrganiza
            </Link>
            {user ? (
              <Link
                href="/dashboard/icobra"
                className="rounded-md bg-[#00C853] px-4 py-1.5 text-sm font-semibold text-black transition-all hover:bg-[#00E060] active:scale-95"
              >
                Acessar painel
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-[#F0F4F0]/60 transition-colors hover:text-[#F0F4F0]"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-[#00C853] px-4 py-1.5 text-sm font-semibold text-black transition-all hover:bg-[#00E060] active:scale-95"
                >
                  Começar grátis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4">
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,200,83,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.04) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-[#00C853]/6 blur-[120px]" />
        </div>

        {/* Corner glows */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#00C853]/4 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#00C853]/3 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Status badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00C853]/20 bg-[#00C853]/8 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C853] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C853]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00C853]">
              Gestão de cobranças
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-[-0.03em] text-white md:text-[5.5rem]">
            Empréstimos sob controle.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #00C853 0%, #69F0AE 100%)',
              }}
            >
              Cobranças que chegam.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-7 max-w-2xl text-xl leading-relaxed text-[#F0F4F0]/50">
            Gerencie quem deve, quanto deve e quando paga — tudo em um painel limpo
            e sem complicação.
          </p>

          {/* Stats row */}
          <div className="mx-auto mt-10 flex max-w-sm items-center justify-center gap-8 border-y border-[#00C853]/10 py-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="mt-0.5 text-xs text-[#F0F4F0]/40">Online</p>
            </div>
            <div className="h-8 w-px bg-[#00C853]/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="mt-0.5 text-xs text-[#F0F4F0]/40">Planilhas</p>
            </div>
            <div className="h-8 w-px bg-[#00C853]/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="mt-0.5 text-xs text-[#F0F4F0]/40">Empréstimos</p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link
                href="/dashboard/icobra"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#00C853] px-8 py-4 text-base font-bold text-black transition-all hover:bg-[#00E060] hover:shadow-[0_0_40px_-4px_rgba(0,200,83,0.5)] active:scale-[0.97]"
              >
                Acessar meu painel
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#00C853] px-8 py-4 text-base font-bold text-black transition-all hover:bg-[#00E060] hover:shadow-[0_0_40px_-4px_rgba(0,200,83,0.5)] active:scale-[0.97]"
                >
                  Começar grátis
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded-xl border border-[#F0F4F0]/10 px-8 py-4 text-base font-medium text-[#F0F4F0]/60 transition-all hover:border-[#F0F4F0]/20 hover:text-[#F0F4F0]"
                >
                  Já tenho conta
                </Link>
              </>
            )}
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-[#F0F4F0]/25">
            Parte do ecossistema{' '}
            <Link href="/" className="text-[#F0F4F0]/40 underline-offset-2 hover:text-[#F0F4F0]/60 hover:underline transition-colors">
              iOrganiza
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
