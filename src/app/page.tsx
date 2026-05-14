import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, Layers, RefreshCw } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const benefits = [
  { icon: Zap, title: 'Tudo em um lugar', desc: 'Acesse todos os seus SaaS com um único login.' },
  { icon: Shield, title: 'Pagamento seguro', desc: 'Stripe, Kiwify, Hotmart e Kirvano integrados.' },
  { icon: Layers, title: 'Dados conectados', desc: 'Compartilhe dados entre sistemas que você assina.' },
  { icon: RefreshCw, title: 'Cobrança transparente', desc: 'Veja faturas, cancelamentos e renovações.' },
];

const faqs = [
  { q: 'Como funciona o iOrganiza?', a: 'Você cria uma conta, assina os SaaS que precisar e gerencia tudo de um único painel.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Acesse Faturamento e cancele com um clique. Acesso mantido até o fim do período pago.' },
  { q: 'Posso comprar fora do iOrganiza?', a: 'Sim. Você também pode comprar via Kiwify, Hotmart e Kirvano e o acesso é ativado automaticamente.' },
  { q: 'Meus dados ficam isolados entre SaaS?', a: 'Sim. Por padrão dados são isolados. Você decide quais sistemas podem compartilhar dados entre si.' },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-border py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
          <div className="container relative">
            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-foreground md:text-6xl">
              Todos os seus SaaS em <span className="text-primary">um único lugar</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              iOrganiza Hub centraliza login, faturamento e dados entre os sistemas que você usa. Assine só o que precisar, integre quando quiser.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/catalogo">Explorar Sistemas</Link>
              </Button>
              {user ? (
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">Acessar dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/auth/login">Entrar</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link href="/auth/signup">Criar conta grátis</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-border py-20">
          <div className="container">
            <h2 className="mb-12 text-3xl font-bold">Por que iOrganiza</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <Card key={b.title} className="border-border">
                    <CardContent className="p-6">
                      <Icon className="mb-4 h-8 w-8 text-primary" />
                      <h3 className="mb-2 font-semibold">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border py-20">
          <div className="container max-w-3xl">
            <h2 className="mb-12 text-3xl font-bold">Perguntas frequentes</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-semibold text-foreground">{f.q}</h3>
                    <p className="text-sm text-muted-foreground">{f.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container text-center">
            <h2 className="mb-4 text-3xl font-bold">Pronto pra começar?</h2>
            <p className="mb-8 text-muted-foreground">Cadastre-se grátis e explore o catálogo.</p>
            <Button asChild size="lg">
              <Link href="/auth/signup">Criar conta agora</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
