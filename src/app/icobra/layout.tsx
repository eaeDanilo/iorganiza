import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'iCobra — Gestão de cobranças e empréstimos',
  description: 'Controle empréstimos, parcelas e inadimplentes em um único lugar.',
};

export default function ICobraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={grotesk.variable}
      style={{ fontFamily: 'var(--font-grotesk)', fontFeatureSettings: '"tnum" 1' }}
    >
      {children}
    </div>
  );
}
