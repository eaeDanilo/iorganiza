import { redirect } from "next/navigation";
import { Figtree } from "next/font/google";
import { Button } from "@/components/ui/button";
import { IMaletaLayoutShell } from "@/components/imaleta/LayoutShell";
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
      <IMaletaLayoutShell userEmail={user.email ?? ""} logoutButton={logoutButton}>
        {children}
      </IMaletaLayoutShell>
    </div>
  );
}
