import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function LogoutButton() {
  async function action() {
    'use server';
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect('/');
  }
  return (
    <form action={action}>
      <Button variant="ghost" size="sm" type="submit">Sair</Button>
    </form>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <header className="relative flex h-20 items-center justify-between overflow-hidden border-b border-border px-8">
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
          <Link href="/" className="relative text-xl font-bold text-white drop-shadow">Dashboard</Link>
          <div className="relative flex items-center gap-4">
            <span className="rounded-full bg-black/30 px-4 py-1.5 text-sm text-white backdrop-blur">
              {user.email}
            </span>
            {user.is_admin && (
              <Button asChild variant="outline" size="sm" className="border-white/30 bg-black/20 text-white backdrop-blur hover:bg-black/40">
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
