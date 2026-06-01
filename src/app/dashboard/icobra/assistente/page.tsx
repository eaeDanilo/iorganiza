import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/icobra/PageHeader";
import { AssistenteChat } from "@/components/icobra/AssistenteChat";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AssistentePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = await createSupabaseServerClient();

  // Find iCobra saas_id by slug
  const { data: icobraSaas } = await supabase
    .from("saas")
    .select("id")
    .eq("slug", "icobra")
    .maybeSingle();

  let hasAiAccess = false;

  if (icobraSaas) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("saas_id", icobraSaas.id)
      .eq("status", "active")
      .maybeSingle();

    hasAiAccess = !!sub;
  }

  if (!hasAiAccess) {
    return (
      <>
        <PageHeader
          title="Assistente IA"
          description="Gerencie empréstimos por linguagem natural."
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center gap-4 mt-6">
          <span className="text-4xl">✦</span>
          <h2 className="text-xl font-bold">Recurso exclusivo do plano Pro</h2>
          <p className="max-w-sm text-muted-foreground text-sm">
            O assistente IA está disponível apenas no plano Pro do iCobra. Faça
            upgrade para desbloquear gerenciamento por linguagem natural.
          </p>
          <Button asChild size="lg">
            <Link href="/saas/icobra">Ver planos</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Assistente"
        description="Gerencie empréstimos por linguagem natural."
      />
      <AssistenteChat />
    </>
  );
}
