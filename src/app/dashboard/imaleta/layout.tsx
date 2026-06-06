import { redirect } from "next/navigation";
import { Figtree } from "next/font/google";
import { Button } from "@/components/ui/button";
import { IMaletaLayoutShell } from "@/components/imaleta/LayoutShell";
import { TrialBanner } from "@/components/shared/TrialBanner";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default async function IMaletaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/imaleta");

  const supabase = await createSupabaseServerClient();
  const { data: saas } = await supabase.from('saas').select('id').eq('slug', 'imaleta').single();
  const subscription = saas
    ? (await supabase.from('subscriptions').select('payment_method').eq('user_id', user.id).eq('saas_id', saas.id).maybeSingle()).data
    : null;

  const isTrial = !subscription || subscription.payment_method === 'manual';

  async function logoutAction() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/imaleta");
  }

  const logoutButton = (
    <form action={logoutAction}>
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        className="hover:bg-white/[0.06]"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        Sair
      </Button>
    </form>
  );

  return (
    <div className={figtree.variable} style={{ fontFamily: "var(--font-figtree)" }}>
      {isTrial && (
        <>
          <TrialBanner
            subscribeHref="/saas/imaleta"
            accent="#DEDAD3"
            bg="#0F0F0F"
          />
          <div style={{ height: 40 }} />
        </>
      )}
      <IMaletaLayoutShell userEmail={user.email ?? ""} logoutButton={logoutButton}>
        {children}
      </IMaletaLayoutShell>
    </div>
  );
}
