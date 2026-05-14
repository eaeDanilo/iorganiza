import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

const updateSchema = z.object({
  full_name: z.string().nullable().optional(),
  is_admin: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('users')
      .select('*, subscriptions:subscriptions(*, saas:saas(name)), payments:payments(*)')
      .eq('id', params.id)
      .maybeSingle();
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = updateSchema.parse(await req.json());
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('users').update(body).eq('id', params.id).select('*').single();
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}
