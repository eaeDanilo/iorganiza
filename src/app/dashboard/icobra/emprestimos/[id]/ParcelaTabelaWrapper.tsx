"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ParcelaTabela } from "@/components/icobra/emprestimos/ParcelaTabela";
import { marcarParcelaPaga, desmarcarParcelaPaga } from "../actions";
import type { Parcela } from "@/lib/icobra/types";

export function ParcelaTabelaWrapper({ parcelas }: { parcelas: Parcela[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleMarcarPago(id: string, dataPagamento: string) {
    try {
      await marcarParcelaPaga(id, dataPagamento);
      toast.success("Pagamento registrado!");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar.");
    }
  }

  async function handleDesmarcarPago(id: string) {
    try {
      await desmarcarParcelaPaga(id);
      toast.success("Pagamento desfeito.");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao desfazer.");
    }
  }

  return (
    <ParcelaTabela
      parcelas={parcelas}
      onMarcarPago={handleMarcarPago}
      onDesmarcarPago={handleDesmarcarPago}
    />
  );
}
