export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

const updateSchema = z.object({
  full_name: z.string().nullable().optional(),
  is_admin: z.boolean().optional(),
  is_super_admin: z.boolean().optional(),
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
    const body = updateSchema.parse(await req.json());
    const hasRoleChange = 'is_admin' in body || 'is_super_admin' in body;
    const caller = hasRoleChange ? await requireSuperAdmin() : await requireAdmin();
    if (caller.id === params.id && (body.is_admin === false || body.is_super_admin === false)) {
      throw new Error('FORBIDDEN');
    }
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('users').update(body).eq('id', params.id).select('*').single();
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const caller = await requireSuperAdmin();
    if (caller.id === params.id) throw new Error('FORBIDDEN');
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (e) { return handleError(e); }
}
