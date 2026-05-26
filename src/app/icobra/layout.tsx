import type { Metadata } from 'next';
import { Bebas_Neue, DM_Mono } from 'next/font/google';

const bebas = Bebas_Neue({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
  weight: '400',
});

const mono = DM_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-dm',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'iCobra — Gestão de cobranças e empréstimos',
  description: 'Controle empréstimos, parcelas e inadimplentes em um único lugar.',
};

export default function ICobraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bebas.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
