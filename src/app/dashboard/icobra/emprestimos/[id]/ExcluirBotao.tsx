"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/icobra/ConfirmModal";
import { deletarEmprestimo } from "../actions";

export function ExcluirBotao({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  async function handleConfirm() {
    try {
      await deletarEmprestimo(id);
      toast.success("Empréstimo excluído.");
      router.push("/dashboard/icobra/emprestimos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)}>
        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
        Excluir
      </Button>
      <ConfirmModal
        open={aberto}
        onOpenChange={setAberto}
        title={`Excluir empréstimo de ${nome}?`}
        description="Esta ação não pode ser desfeita. Todas as parcelas serão removidas."
        confirmText="Sim, excluir"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  );
}
