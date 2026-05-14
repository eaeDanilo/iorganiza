// SDK iOrganiza — auth compartilhada + check de entitlement.
// SaaS filho usa para validar se usuário pagou pelo seu acesso.
//
// Setup no SaaS filho:
// 1. Reusar MESMO projeto Supabase do hub (mesmas URL/keys).
// 2. Configurar env: IORGANIZA_HUB_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
// 3. Cada SaaS define seu próprio slug. Validar entitlement antes de servir dados.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ==================== CLIENTS ====================
export function createIorganizaBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function createIorganizaServerClient(cookieAdapter: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  remove: (name: string, options: CookieOptions) => void;
}) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: cookieAdapter.get,
      set: cookieAdapter.set,
      remove: cookieAdapter.remove,
    },
  });
}

export function createIorganizaServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ==================== ENTITLEMENT ====================
export interface Entitlement {
  active: boolean;
  status: 'active' | 'canceled' | 'pending' | 'expired' | null;
  currentPeriodEnd: string | null;
}

/**
 * Verifica se o usuário corrente tem assinatura ativa do SaaS identificado por slug.
 * Use em getServerSideProps, middleware ou route handler do SaaS filho.
 */
export async function checkEntitlement(
  supabase: ReturnType<typeof createServerClient>,
  saasSlug: string,
): Promise<Entitlement> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: false, status: null, currentPeriodEnd: null };

  const { data: saas } = await supabase
    .from('saas')
    .select('id')
    .eq('slug', saasSlug)
    .maybeSingle();
  if (!saas) return { active: false, status: null, currentPeriodEnd: null };

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .eq('saas_id', saas.id)
    .maybeSingle();
  if (!sub) return { active: false, status: null, currentPeriodEnd: null };

  return {
    active: sub.status === 'active',
    status: sub.status as Entitlement['status'],
    currentPeriodEnd: sub.current_period_end,
  };
}

// ==================== INTEGRATION CHECK ====================
/**
 * Verifica se este SaaS pode compartilhar dados com outro SaaS para o usuário corrente.
 * Útil quando você quer importar contatos/dados de outro sistema iOrganiza.
 */
export async function canIntegrateWith(
  supabase: ReturnType<typeof createServerClient>,
  sourceSaasSlug: string,
  targetSaasSlug: string,
): Promise<{ allowed: boolean; enabled: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, enabled: false };

  const { data: saasList } = await supabase
    .from('saas')
    .select('id, slug')
    .in('slug', [sourceSaasSlug, targetSaasSlug]);
  if (!saasList || saasList.length < 2) return { allowed: false, enabled: false };

  const sourceId = saasList.find((s) => s.slug === sourceSaasSlug)?.id;
  const targetId = saasList.find((s) => s.slug === targetSaasSlug)?.id;
  if (!sourceId || !targetId) return { allowed: false, enabled: false };

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('saas_id, status')
    .eq('user_id', user.id)
    .in('saas_id', [sourceId, targetId]);

  const activeIds = new Set((subs ?? []).filter((s) => s.status === 'active').map((s) => s.saas_id));
  const allowed = activeIds.has(sourceId) && activeIds.has(targetId);

  let enabled = false;
  if (allowed) {
    const { data: integ } = await supabase
      .from('saas_integrations')
      .select('is_enabled')
      .eq('user_id', user.id)
      .eq('source_saas_id', sourceId)
      .eq('target_saas_id', targetId)
      .maybeSingle();
    enabled = integ?.is_enabled ?? false;
  }
  return { allowed, enabled };
}

// ==================== REDIRECT HELPERS ====================
export function hubUrl(path = ''): string {
  const base = process.env.IORGANIZA_HUB_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}${path}`;
}

export function loginRedirect(currentPath = ''): string {
  return hubUrl(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
}

export function checkoutRedirect(saasId: string): string {
  return hubUrl(`/checkout/${saasId}`);
}
