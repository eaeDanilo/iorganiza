'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
/** Captcha só é exigido quando a site key está configurada (build/Vercel). */
export const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Falha ao carregar Turnstile.'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  reset: () => void;
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

/**
 * Widget Cloudflare Turnstile. Os tokens são de uso único: após uma tentativa
 * de auth falha, chame `ref.reset()` para obter um novo token.
 */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(
  function Turnstile({ onVerify, onExpire, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    // refs p/ callbacks atuais sem re-renderizar o widget
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      if (!turnstileEnabled) return;
      let cancelled = false;
      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          if (widgetIdRef.current) return; // já renderizado
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => onVerifyRef.current(token),
            'expired-callback': () => onExpireRef.current?.(),
            'error-callback': () => onExpireRef.current?.(),
          });
        })
        .catch(() => {});
      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, []);

    if (!turnstileEnabled) return null;
    return <div ref={containerRef} className={className} />;
  }
);
