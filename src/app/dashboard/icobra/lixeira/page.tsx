import { PageHeader } from "@/components/icobra/PageHeader";
import { LixeiraCliente } from "./LixeiraCliente";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import type { Emprestimo } from "@/lib/icobra/types";

export const dynamic = "force-dynamic";

export default async function LixeiraPage() {
  const user = (await getCurrentUser())!;
  const supabase = createICobraServiceClient();

  const { data: emprestimos } = await supabase
    .from("emprestimos")
    .select("*")
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Lixeira"
        description="Empréstimos excluídos. Restaure ou apague permanentemente."
      />
      <LixeiraCliente emprestimos={(emprestimos as Emprestimo[]) ?? []} />
    </div>
  );
}
