import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { Analytics } from '@/components/shared/Analytics';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iorganiza.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'iOrganiza — Sistemas de gestão para o seu negócio',
    template: '%s | iOrganiza',
  },
  description:
    'Controle empréstimos e cobranças com o iCobra, gerencie maletas de consignação com o iMaleta. Sistemas simples, em português, direto no celular.',
  keywords: [
    'controle de empréstimos',
    'gestão de cobranças',
    'controle de inadimplência',
    'maleta de consignação',
    'gestão de maletas',
    'venda consignada',
    'sistema de gestão',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'iOrganiza',
    title: 'iOrganiza — Sistemas de gestão para o seu negócio',
    description:
      'Controle empréstimos e cobranças com o iCobra, gerencie maletas de consignação com o iMaleta. Simples, em português, direto no celular.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iOrganiza — Sistemas de gestão para o seu negócio',
    description:
      'Controle empréstimos e cobranças com o iCobra, gerencie maletas de consignação com o iMaleta.',
  },
  icons: { icon: '/logo.svg', apple: '/logo.png' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${jakarta.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
