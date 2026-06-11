import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-primary">iOrganiza</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistemas simples de gestão para o pequeno negócio brasileiro.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Sistemas</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/icobra" className="hover:text-foreground">iCobra — controle de empréstimos</Link></li>
            <li><Link href="/imaleta" className="hover:text-foreground">iMaleta — maletas de consignação</Link></li>
            <li><Link href="/catalogo" className="hover:text-foreground">Catálogo completo</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Conta</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/auth/signup" className="hover:text-foreground">Criar conta grátis</Link></li>
            <li><Link href="/auth/login" className="hover:text-foreground">Entrar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Jurídico</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/termos" className="hover:text-foreground">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-foreground">Política de Privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} iOrganiza. Todos os direitos reservados.
      </div>
    </footer>
  );
}
