import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">iOrganiza</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/catalogo" className="text-sm text-muted-foreground hover:text-foreground">
            Catálogo
          </Link>
          {user ? (
            <>
              {user.is_admin && (
                <Link href="/admin" className="text-sm text-secondary hover:text-secondary/80">
                  Admin
                </Link>
              )}
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Cadastrar</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
