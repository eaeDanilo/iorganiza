"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/icobra/ConfirmModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { restaurarEmprestimo, deletarEmprestimoPermanente } from "../emprestimos/actions";
import type { Emprestimo } from "@/lib/icobra/types";

export function LixeiraCliente({ emprestimos }: { emprestimos: Emprestimo[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [paraExcluir, setParaExcluir] = useState<Emprestimo | null>(null);

  async function handleRestaurar(id: string) {
    try {
      await restaurarEmprestimo(id);
      toast.success("Empréstimo restaurado.");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao restaurar.");
    }
  }

  async function handleExcluirPermanente() {
    if (!paraExcluir) return;
    try {
      await deletarEmprestimoPermanente(paraExcluir.id);
      toast.success("Empréstimo excluído permanentemente.");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  }

  if (emprestimos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Trash2 className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">Lixeira vazia.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {emprestimos.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.nome_pessoa}</p>
                <p className="tabular-nums text-muted-foreground">{formatCurrency(Number(e.valor_emprestado))}</p>
                <p className="text-xs text-muted-foreground">
                  Excluído em {e.deleted_at ? formatDate(e.deleted_at.slice(0, 10)) : "—"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleRestaurar(e.id)}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Restaurar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setParaExcluir(e)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={!!paraExcluir}
        onOpenChange={(o) => !o && setParaExcluir(null)}
        title={`Excluir permanentemente?`}
        description={`"${paraExcluir?.nome_pessoa}" será removido definitivamente. Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir para sempre"
        variant="destructive"
        onConfirm={handleExcluirPermanente}
      />
    </>
  );
}
