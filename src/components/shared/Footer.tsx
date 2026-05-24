import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-primary">iOrganiza</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Plataforma centralizada para todos seus sistemas de produtividade.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Produto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/catalogo" className="hover:text-foreground">Catálogo</Link></li>
            <li><Link href="/auth/signup" className="hover:text-foreground">Criar conta</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Empresa</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/sobre" className="hover:text-foreground">Sobre</Link></li>
            <li><Link href="/contato" className="hover:text-foreground">Contato</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Jurídico</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/termos" className="hover:text-foreground">Termos</Link></li>
            <li><Link href="/privacidade" className="hover:text-foreground">Privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} iOrganiza. Todos os direitos reservados.
      </div>
    </footer>
  );
}
