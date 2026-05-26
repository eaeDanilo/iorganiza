import { redirect } from "next/navigation";
import { Figtree } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ICobraLayoutShell } from "@/components/icobra/LayoutShell";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default async function ICobraLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/icobra");

  async function logoutAction() {
    "use server";
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/icobra");
  }

  const logoutButton = (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit" className="text-white/50 hover:text-white hover:bg-white/[0.06]">
        Sair
      </Button>
    </form>
  );

  return (
    <div className={figtree.variable} style={{ fontFamily: "var(--font-figtree)" }}>
      <ICobraLayoutShell userEmail={user.email ?? ""} logoutButton={logoutButton}>
        {children}
      </ICobraLayoutShell>
    </div>
  );
}
