import { redirect } from "next/navigation";
import { LayoutShell } from "@/components/dashboard/LayoutShell";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('saas:saas(slug, name)')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const activeSaas = (subs ?? [])
    .map((s: any) => s.saas)
    .filter(Boolean) as { slug: string; name: string }[];

  async function logoutAction() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  const logoutButton = (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit" className="text-white hover:bg-white/10 hover:text-white">
        Sair
      </Button>
    </form>
  );

  return (
    <LayoutShell
      userEmail={user.email}
      isAdmin={user.is_admin ?? false}
      logoutButton={logoutButton}
      activeSaas={activeSaas}
    >
      {children}
    </LayoutShell>
  );
}
