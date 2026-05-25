import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createICobraServiceClient } from '@/lib/icobra/supabase';

const ICOBRA_SLUG = 'icobra';

export const PLAN_LIMITS = {
  free: { max_emprestimos: 5, api_per_hour: 60 },
  paid: { max_emprestimos: Infinity, api_per_hour: 500 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export async function getICobraPlan(userId: string): Promise<Plan> {
  const supabase = createSupabaseServerClient();

  const { data: saas } = await supabase
    .from('saas')
    .select('id')
    .eq('slug', ICOBRA_SLUG)
    .maybeSingle();

  if (!saas) return 'free';

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('saas_id', saas.id)
    .eq('status', 'active')
    .maybeSingle();

  return sub ? 'paid' : 'free';
}

export interface EmprestimoUsage {
  count: number;
  max: number;
  atLimit: boolean;
}

/** Retorna null para plano pago (sem limite visível). */
export async function getEmprestimoUsage(userId: string): Promise<EmprestimoUsage | null> {
  const plan = await getICobraPlan(userId);
  const max = PLAN_LIMITS[plan].max_emprestimos;
  if (max === Infinity) return null;

  const supabase = createICobraServiceClient();
  const { count } = await supabase
    .from('emprestimos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'ativo')
    .is('deleted_at', null);

  const current = count ?? 0;
  return { count: current, max, atLimit: current >= max };
}

export async function assertEmprestimoLimit(userId: string): Promise<void> {
  const plan = await getICobraPlan(userId);
  const max = PLAN_LIMITS[plan].max_emprestimos;
  if (max === Infinity) return;

  const supabase = createICobraServiceClient();
  const { count, error } = await supabase
    .from('emprestimos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'ativo')
    .is('deleted_at', null);

  if (error) throw error;

  if ((count ?? 0) >= max) {
    throw new Error(
      `Limite do plano gratuito atingido: máximo ${max} empréstimos ativos. Faça upgrade para criar mais.`
    );
  }
}

export async function assertApiRateLimit(userId: string, endpoint: string): Promise<void> {
  const plan = await getICobraPlan(userId);
  const limit = PLAN_LIMITS[plan].api_per_hour;

  const supabase = createSupabaseServerClient();
  const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_limit: limit,
    p_window_seconds: 3600,
  });

  if (error) throw error;

  if (!allowed) {
    throw new Error(
      `Limite de ${limit} requisições/hora atingido. Tente novamente mais tarde.`
    );
  }
}
