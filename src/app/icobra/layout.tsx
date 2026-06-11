import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const title = 'iCobra — Controle de empréstimos e cobranças';
const description =
  'Saiba quem deve, quanto deve e quando paga. Controle empréstimos, parcelas e inadimplência sem planilha, direto no celular. Teste grátis.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/icobra' },
  keywords: [
    'controle de empréstimos',
    'sistema de cobrança',
    'controle de inadimplência',
    'app para emprestar dinheiro',
    'controle de fiado',
  ],
  openGraph: {
    title,
    description,
    url: '/icobra',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function ICobraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={figtree.variable} style={{ fontFamily: 'var(--font-figtree)' }}>
      {children}
    </div>
  );
}
