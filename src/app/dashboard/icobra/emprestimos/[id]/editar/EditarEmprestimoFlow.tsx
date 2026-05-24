"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmprestimoForm } from "@/components/icobra/emprestimos/EmprestimoForm";
import { EmprestimoRevisao } from "@/components/icobra/emprestimos/EmprestimoRevisao";
import { editarEmprestimo } from "../../actions";
import type { Emprestimo, EmprestimoFormData } from "@/lib/icobra/types";

type Etapa = "form" | "revisao";

export function EditarEmprestimoFlow({ emprestimo }: { emprestimo: Emprestimo }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("form");
  const initialData: EmprestimoFormData = {
    nome_pessoa: emprestimo.nome_pessoa,
    valor_emprestado: Number(emprestimo.valor_emprestado),
    tipo_retorno: emprestimo.tipo_retorno,
    percentual: emprestimo.percentual ? Number(emprestimo.percentual) : undefined,
    valor_parcela_input: emprestimo.tipo_retorno === "valor_fixo" ? Number(emprestimo.valor_parcela) : undefined,
    frequencia: emprestimo.frequencia,
    numero_parcelas: emprestimo.numero_parcelas,
    data_primeiro_pagamento: emprestimo.data_primeiro_pagamento,
    dias_pagamento: emprestimo.dias_pagamento,
  };
  const [data, setData] = useState<EmprestimoFormData>(initialData);

  async function handleConfirm() {
    try {
      await editarEmprestimo(emprestimo.id, data);
      toast.success("Empréstimo atualizado!");
      router.push(`/dashboard/icobra/emprestimos/${emprestimo.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar.");
    }
  }

  if (etapa === "form") {
    return (
      <EmprestimoForm
        initialData={data}
        onSubmit={(d) => { setData(d); setEtapa("revisao"); }}
        submitLabel="Continuar para revisão"
        isEdicao
      />
    );
  }

  return (
    <EmprestimoRevisao
      data={data}
      onConfirm={handleConfirm}
      onVoltar={() => setEtapa("form")}
    />
  );
}
