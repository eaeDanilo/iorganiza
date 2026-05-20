export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

const saasSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  external_url: z.string().url().nullable().optional(),
  price_monthly: z.number().nonnegative(),
  features: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  stripe_product_id: z.string().nullable().optional(),
  stripe_price_id: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('saas')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = saasSchema.parse(await req.json());
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('saas').insert(body).select('*').single();
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}
