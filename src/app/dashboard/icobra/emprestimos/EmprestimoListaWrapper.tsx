"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmprestimoLista } from "@/components/icobra/emprestimos/EmprestimoLista";
import { deletarEmprestimo } from "./actions";
import type { Emprestimo, Parcela } from "@/lib/icobra/types";

export function EmprestimoListaWrapper({
  emprestimos,
}: {
  emprestimos: (Emprestimo & { parcelas: Parcela[] })[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleDelete(id: string) {
    try {
      await deletarEmprestimo(id);
      toast.success("Empréstimo movido para a lixeira.");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  }

  return <EmprestimoLista emprestimos={emprestimos} onDelete={handleDelete} />;
}
