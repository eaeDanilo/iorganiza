'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Erro ao carregar checkout</h1>
        <p className="mb-6 text-muted-foreground">Ocorreu um erro inesperado. Tente novamente.</p>
        <Button asChild>
          <Link href="/dashboard/catalogo">Voltar ao catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
