export const CONSENT_KEY = 'iorganiza_cookie_consent';
export const CONSENT_EVENT = 'iorganiza:consent-granted';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/**
 * Dispara evento GA4 se o usuário consentiu e o GA está carregado.
 * No-op silencioso caso contrário — nunca quebra o fluxo do usuário.
 */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const w = window as GtagWindow;
  w.gtag?.('event', name, params);
}
