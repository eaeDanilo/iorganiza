/**
 * Cria subscription do iCobra para o usuário atual.
 *
 * Pré-requisito: rodar no Supabase SQL editor:
 *   ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'manual';
 *
 * Uso: node scripts/seed-icobra-subscription.mjs
 */
import { createClient } from '@supabase/supabase-js';
// Node 20.12+ built-in env file loader
process.loadEnvFile(new URL('../.env.local', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const EMAIL = 'eaedanilo1@gmail.com';

const { data: user } = await supabase.from('users').select('id').eq('email', EMAIL).maybeSingle();
if (!user) { console.error('Usuário não encontrado:', EMAIL); process.exit(1); }

const { data: saas } = await supabase.from('saas').select('id, name').eq('slug', 'icobra').maybeSingle();
if (!saas) { console.error('SaaS "icobra" não encontrado no banco'); process.exit(1); }

const now = new Date().toISOString();
const yearEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

const { error } = await supabase.from('subscriptions').upsert({
  user_id: user.id,
  saas_id: saas.id,
  status: 'active',
  payment_method: 'manual',
  price_paid: 0,
  current_period_start: now,
  current_period_end: yearEnd,
}, { onConflict: 'user_id,saas_id' });

if (error) {
  console.error('Erro ao criar subscription:', error.message);
  console.error('Se o erro for "invalid input value for enum payment_method", execute no Supabase SQL editor:');
  console.error('  ALTER TYPE payment_method ADD VALUE IF NOT EXISTS \'manual\';');
  process.exit(1);
}

console.log(`✓ Subscription criada: ${EMAIL} → ${saas.name} (ativa por 1 ano)`);
