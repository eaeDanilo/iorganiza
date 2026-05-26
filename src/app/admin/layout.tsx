import { redirect } from 'next/navigation';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function LogoutButton() {
  async function action() {
    'use server';
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect('/');
  }
  return (
    <form action={action}>
      <Button variant="ghost" size="sm" type="submit" className="text-white hover:bg-white/10 hover:text-white">
        Sair
      </Button>
    </form>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  if (!user.is_admin) redirect('/dashboard');

  return (
    <AdminLayoutShell userEmail={user.email} logoutButton={<LogoutButton />}>
      {children}
    </AdminLayoutShell>
  );
}
