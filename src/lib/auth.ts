import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import type { User } from '@/types/database';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const { data } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  if (data) return data as User;

  // Trigger trg_auth_user_created não rodou (conta criada antes do trigger ou não aplicado).
  // Upsert via service client para quebrar o loop infinito login ↔ dashboard.
  const serviceClient = createSupabaseServiceClient();
  const { data: upserted } = await serviceClient
    .from('users')
    .upsert(
      {
        id: authUser.id,
        email: authUser.email!,
        full_name: (authUser.user_metadata?.full_name as string) ?? '',
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  return (upserted as User) ?? null;
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) throw new Error('UNAUTHORIZED');
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (!u.is_admin) throw new Error('FORBIDDEN');
  return u;
}

export async function requireSuperAdmin(): Promise<User> {
  const u = await requireUser();
  if (!u.is_super_admin) throw new Error('FORBIDDEN');
  return u;
}
