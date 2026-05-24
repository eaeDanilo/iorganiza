import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ICobraLayoutShell } from "@/components/icobra/LayoutShell";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ICobraLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  async function logoutAction() {
    "use server";
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  const logoutButton = (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit">
        Sair
      </Button>
    </form>
  );

  return (
    <ICobraLayoutShell userEmail={user.email} logoutButton={logoutButton}>
      {children}
    </ICobraLayoutShell>
  );
}
