import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieConsent } from '@/components/shared/CookieConsent';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'iOrganiza — Centralize seus sistemas',
  description: 'Plataforma unificada para todos os seus sistemas de produtividade.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${jakarta.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Script src="/prevent-zoom.js" strategy="afterInteractive" />
        {children}
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  );
}
