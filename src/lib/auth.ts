import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User } from '@/types/database';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const { data } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  return (data as User) ?? null;
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
