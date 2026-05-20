export const dynamic = 'force-dynamic'
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

// Read-only por enquanto: status das envs presentes.
// Para gravar config em runtime, criar tabela `settings` no DB. Mantemos config via env.
export async function GET() {
  try {
    await requireAdmin();
    const keys = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'KIWIFY_API_KEY',
      'KIWIFY_WEBHOOK_SECRET',
      'HOTMART_CLIENT_ID',
      'HOTMART_WEBHOOK_SECRET',
      'KIRVANO_API_KEY',
      'KIRVANO_WEBHOOK_SECRET',
      'RESEND_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];
    const status = Object.fromEntries(keys.map((k) => [k, !!process.env[k]]));
    return jsonOk({ envStatus: status, appUrl: process.env.NEXT_PUBLIC_APP_URL });
  } catch (e) { return handleError(e); }
}
