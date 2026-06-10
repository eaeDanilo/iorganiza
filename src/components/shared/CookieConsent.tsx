'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'iorganiza_cookie_consent';

function setConsentCookie(value: string) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${CONSENT_KEY}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept(type: 'all' | 'necessary') {
    localStorage.setItem(CONSENT_KEY, type);
    setConsentCookie(type);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-xl border border-border bg-card p-4 shadow-2xl sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Cookie className="hidden shrink-0 text-muted-foreground sm:block" size={20} />
          <p className="flex-1 text-sm text-muted-foreground">
            Usamos cookies essenciais para manter o site funcionando e de terceiros para análise de desempenho.
            Ao continuar, você concorda com nossa{' '}
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => accept('necessary')}
            >
              Apenas necessários
            </Button>
            <Button
              size="sm"
              onClick={() => accept('all')}
            >
              Aceitar todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
