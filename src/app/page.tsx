import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

const faqs = [
  { q: 'Como funciona o iOrganiza?', a: 'Você cria uma conta grátis, assina só os sistemas que precisar e gerencia tudo de um único painel, com um único login.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Acesse Faturamento e cancele com um clique. Seu acesso é mantido até o fim do período já pago.' },
  { q: 'Funciona no celular?', a: 'Sim. Tudo foi feito para funcionar no celular, do cadastro ao uso diário — inclusive leitura de código de barras pela câmera no iMaleta.' },
  { q: 'Posso comprar fora do iOrganiza?', a: 'Sim. Você também pode comprar via Kiwify, Hotmart e Kirvano e o acesso é ativado automaticamente.' },
  { q: 'Meus dados estão seguros?', a: 'Sim. Seus dados ficam isolados por sistema, seguimos a LGPD e você pode exportar ou excluir seus dados quando quiser.' },
];

const trust = [
  { title: 'Sem fidelidade', desc: 'Assine e cancele quando quiser, sem multa e sem ligação de retenção.' },
  { title: 'Pagamento seguro', desc: 'Cobrança via Stripe, Kiwify, Hotmart ou Kirvano. Nunca guardamos seu cartão.' },
  { title: 'LGPD de verdade', desc: 'Consentimento explícito, exportação e exclusão de dados na sua mão.' },
  { title: 'Em português, sem manual', desc: 'Feito para o dia a dia do pequeno negócio brasileiro. Abriu, usou.' },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'iOrganiza',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://iorganiza.com.br',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://iorganiza.com.br'}/logo.png`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
          <div className="container relative">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
              Organize seu negócio <span className="text-primary">sem planilha</span> e sem caderno.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Sistemas simples para quem empresta dinheiro, vende fiado ou trabalha com maletas de
              consignação. Um login, um painel, tudo no celular.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {user ? (
                <>
                  <Button asChild size="lg" className="h-12 px-8">
                    <Link href="/dashboard">Acessar painel</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12">
                    <Link href="/catalogo">Ver sistemas</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="h-12 px-8">
                    <Link href="/auth/signup">Criar conta grátis</Link>
                  </Button>
                  <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Já tenho conta →
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Grátis para começar · Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </section>

        {/* PRODUTOS */}
        <section className="border-b border-border py-20" aria-labelledby="produtos-titulo">
          <div className="container">
            <h2 id="produtos-titulo" className="text-3xl font-bold">
              Escolha o sistema para o seu trabalho
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Cada sistema resolve um problema específico. Assine só o que usar.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* iCobra */}
              <article className="flex flex-col justify-between rounded-2xl bg-[#0C1A10] p-8 ring-1 ring-[#00C853]/20 md:p-10">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00C853]">
                      <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7L6 10L11 4" stroke="#0C1A10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <h3 className="text-2xl font-bold text-white">iCobra</h3>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">
                    Recupere o que te devem.
                  </p>
                  <p className="mt-2 text-white/60">
                    Controle empréstimos, parcelas e inadimplência. Veja quem deve, quanto deve e
                    quando paga — sem planilha, sem caderno.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/icobra"
                    className="inline-flex h-11 items-center rounded-lg bg-[#00C853] px-6 text-sm font-semibold text-[#0C1A10] transition-colors hover:bg-[#22D96A]"
                  >
                    Conhecer o iCobra
                  </Link>
                </div>
              </article>

              {/* iMaleta */}
              <article className="flex flex-col justify-between rounded-2xl bg-[#181818] p-8 ring-1 ring-[#DEDAD3]/20 md:p-10">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#DEDAD3]">
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <rect x="2" y="7" width="16" height="11" rx="2" stroke="#181818" strokeWidth="2.2" />
                        <path d="M7 7V5a3 3 0 016 0v2" stroke="#181818" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <h3 className="text-2xl font-bold text-white">iMaleta</h3>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">
                    Saiba onde está cada peça.
                  </p>
                  <p className="mt-2 text-white/60">
                    Monte maletas de consignação, bipe produtos pela câmera do celular e descubra na
                    conferência exatamente o que foi vendido.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/imaleta"
                    className="inline-flex h-11 items-center rounded-lg bg-[#DEDAD3] px-6 text-sm font-semibold text-[#181818] transition-colors hover:brightness-95"
                  >
                    Conhecer o iMaleta
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* CONFIANÇA */}
        <section className="border-b border-border py-20" aria-labelledby="confianca-titulo">
          <div className="container">
            <h2 id="confianca-titulo" className="text-3xl font-bold">
              Sem letra miúda
            </h2>
            <dl className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
              {trust.map((t) => (
                <div key={t.title} className="border-t border-border pt-5">
                  <dt className="font-semibold text-foreground">{t.title}</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{t.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border py-20" aria-labelledby="faq-titulo">
          <div className="container max-w-3xl">
            <h2 id="faq-titulo" className="mb-10 text-3xl font-bold">
              Perguntas frequentes
            </h2>
            <div className="divide-y divide-border">
              {faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">Comece hoje, grátis</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Crie sua conta em menos de um minuto e veja o sistema funcionando antes de pagar
              qualquer coisa.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 px-8">
              <Link href={user ? '/dashboard' : '/auth/signup'}>
                {user ? 'Acessar painel' : 'Criar conta grátis'}
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
