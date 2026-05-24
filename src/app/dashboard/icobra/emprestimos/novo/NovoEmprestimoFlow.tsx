"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmprestimoForm } from "@/components/icobra/emprestimos/EmprestimoForm";
import { EmprestimoRevisao } from "@/components/icobra/emprestimos/EmprestimoRevisao";
import { criarEmprestimo } from "../actions";
import type { EmprestimoFormData } from "@/lib/icobra/types";

type Etapa = "form" | "revisao" | "sucesso";

export function NovoEmprestimoFlow() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [data, setData] = useState<EmprestimoFormData | null>(null);
  const [emprestimoId, setEmprestimoId] = useState<string | null>(null);

  async function handleConfirm() {
    if (!data) return;
    try {
      const id = await criarEmprestimo(data);
      setEmprestimoId(id);
      setEtapa("sucesso");
      toast.success("Empréstimo cadastrado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    }
  }

  if (etapa === "form") {
    return (
      <EmprestimoForm
        initialData={data ?? undefined}
        onSubmit={(d) => { setData(d); setEtapa("revisao"); }}
      />
    );
  }

  if (etapa === "revisao" && data) {
    return (
      <EmprestimoRevisao
        data={data}
        onConfirm={handleConfirm}
        onVoltar={() => setEtapa("form")}
      />
    );
  }

  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <CardTitle>Empréstimo salvo!</CardTitle>
        <CardDescription>Você pode acompanhar as parcelas a qualquer momento.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {emprestimoId && (
          <Button asChild size="lg">
            <Link href={`/dashboard/icobra/emprestimos/${emprestimoId}`}>Ver empréstimo</Link>
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => { setData(null); setEmprestimoId(null); setEtapa("form"); router.refresh(); }}>
          Cadastrar outro
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/dashboard/icobra/emprestimos">Ir para a lista</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
