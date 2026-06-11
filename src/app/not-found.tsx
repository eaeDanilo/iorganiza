import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-sm font-semibold text-primary">Erro 404</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Página não encontrada</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          O endereço pode ter mudado ou nunca existiu. Os caminhos abaixo levam de volta ao que importa.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Página inicial</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/catalogo">Ver sistemas</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
