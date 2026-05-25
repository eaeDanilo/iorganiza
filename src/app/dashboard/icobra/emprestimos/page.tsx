import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/icobra/PageHeader";
import { EmprestimoUsageBadge } from "@/components/icobra/EmprestimoUsageBadge";
import { EmprestimoListaWrapper } from "./EmprestimoListaWrapper";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import { getEmprestimoUsage } from "@/lib/limits";
import type { Emprestimo, Parcela } from "@/lib/icobra/types";

export const dynamic = "force-dynamic";

export default async function EmprestimosPage() {
  const user = (await getCurrentUser())!;
  const supabase = createICobraServiceClient();

  const [{ data: emprestimos }, usage] = await Promise.all([
    supabase
      .from("emprestimos")
      .select("*, parcelas(*)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    getEmprestimoUsage(user.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Empréstimos"
        description="Todos os empréstimos que você cadastrou."
        action={
          <div className="flex items-center gap-4">
            {usage && <EmprestimoUsageBadge usage={usage} />}
            <Button asChild>
              <Link href="/dashboard/icobra/emprestimos/novo">
                <Plus className="mr-2 h-5 w-5" />
                Novo empréstimo
              </Link>
            </Button>
          </div>
        }
      />
      <EmprestimoListaWrapper
        emprestimos={(emprestimos as (Emprestimo & { parcelas: Parcela[] })[]) ?? []}
      />
    </div>
  );
}
