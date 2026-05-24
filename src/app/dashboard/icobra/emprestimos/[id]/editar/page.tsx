import { notFound } from "next/navigation";
import { PageHeader } from "@/components/icobra/PageHeader";
import { EditarEmprestimoFlow } from "./EditarEmprestimoFlow";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import type { Emprestimo } from "@/lib/icobra/types";

export const dynamic = "force-dynamic";

export default async function EditarEmprestimoPage({ params }: { params: { id: string } }) {
  const user = (await getCurrentUser())!;
  const supabase = createICobraServiceClient();

  const { data: emprestimo } = await supabase
    .from("emprestimos")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!emprestimo) notFound();

  return (
    <div>
      <PageHeader
        title={`Editar — ${emprestimo.nome_pessoa}`}
        description="As parcelas não pagas serão recalculadas. As já pagas serão mantidas."
      />
      <EditarEmprestimoFlow emprestimo={emprestimo as Emprestimo} />
    </div>
  );
}
