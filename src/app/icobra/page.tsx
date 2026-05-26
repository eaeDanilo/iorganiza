import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function ICobraLandingPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? '/dashboard/icobra' : '/auth/signup';

  return (
    <div className="min-h-screen bg-[#0C1A10] text-white">

      {/* NAV */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00C853]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7L6 10L11 4" stroke="#0C1A10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[17px] font-700 tracking-tight text-white">iCobra</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            iOrganiza
          </Link>
          {!user ? (
            <>
              <Link href="/auth/login?redirect=/dashboard/icobra" className="text-sm text-white/60 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-[#00C853] px-4 py-2 text-sm font-600 text-[#0C1A10] hover:bg-[#22D96A] transition-colors"
              >
                Começar grátis
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard/icobra"
              className="rounded-lg bg-[#00C853] px-4 py-2 text-sm font-600 text-[#0C1A10] hover:bg-[#22D96A] transition-colors"
            >
              Acessar painel
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <main className="mx-auto max-w-5xl px-6 pt-20 pb-16">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#00C853]/10 px-3 py-1.5 ring-1 ring-[#00C853]/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C853]" />
          <span className="text-xs font-500 text-[#00C853]">Gestão de empréstimos</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-2xl text-5xl font-800 leading-[1.08] tracking-[-0.02em] text-white md:text-6xl">
          Controle seus<br />
          empréstimos.<br />
          <span className="text-[#00C853]">Sem planilha.</span>
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/50">
          Veja quem deve, quanto deve e quando paga — tudo num painel limpo, sem complicação.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center gap-4">
          <Link
            href={ctaHref}
            className="rounded-lg bg-[#00C853] px-6 py-3 text-[15px] font-600 text-[#0C1A10] hover:bg-[#22D96A] transition-colors"
          >
            {user ? 'Acessar painel' : 'Começar grátis'}
          </Link>
          {!user && (
            <Link href="/auth/login?redirect=/dashboard/icobra" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Já tenho conta →
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Cadastre em segundos',
              desc: 'Adicione empréstimos e parcelas sem burocracia.',
            },
            {
              title: 'Inadimplentes em foco',
              desc: 'Saiba exatamente quem está em atraso e quanto deve.',
            },
            {
              title: 'Nunca perca um vencimento',
              desc: 'Acompanhe cada cobrança com datas e status claros.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-white/[0.04] p-6 ring-1 ring-white/[0.07]"
            >
              <div className="mb-3 h-1 w-8 rounded-full bg-[#00C853]" />
              <p className="font-600 text-white">{f.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/45">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mx-auto max-w-5xl border-t border-white/[0.06] px-6 py-6">
        <p className="text-xs text-white/25">
          © 2025 iCobra · Parte do{' '}
          <Link href="/" className="text-white/40 hover:text-white/60 transition-colors underline underline-offset-2">
            ecossistema iOrganiza
          </Link>
        </p>
      </footer>
    </div>
  );
}
