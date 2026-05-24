"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Eye, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmprestimoStatusBadge } from "@/components/icobra/StatusBadge";
import { ConfirmModal } from "@/components/icobra/ConfirmModal";
import { formatCurrency } from "@/lib/utils";
import { calcularStatusParcela } from "@/lib/icobra/calculos";
import type { Emprestimo, Parcela } from "@/lib/icobra/types";

interface EmprestimoComResumo extends Emprestimo {
  parcelas?: Parcela[];
}

interface EmprestimoListaProps {
  emprestimos: EmprestimoComResumo[];
  onDelete: (id: string) => Promise<void>;
}

export function EmprestimoLista({ emprestimos, onDelete }: EmprestimoListaProps) {
  const [busca, setBusca] = useState("");
  const [paraDeletar, setParaDeletar] = useState<EmprestimoComResumo | null>(null);

  const todos = useMemo(() =>
    emprestimos.filter((e) =>
      !busca || e.nome_pessoa.toLowerCase().includes(busca.toLowerCase())
    ),
    [emprestimos, busca]
  );

  const ativos = useMemo(() =>
    emprestimos.filter((e) =>
      e.status === "ativo" &&
      (!busca || e.nome_pessoa.toLowerCase().includes(busca.toLowerCase()))
    ),
    [emprestimos, busca]
  );

  const quitados = useMemo(() =>
    emprestimos.filter((e) =>
      e.status === "quitado" &&
      (!busca || e.nome_pessoa.toLowerCase().includes(busca.toLowerCase()))
    ),
    [emprestimos, busca]
  );

  if (emprestimos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Você ainda não cadastrou nenhum empréstimo.</p>
          <Button asChild size="lg">
            <Link href="/dashboard/icobra/emprestimos/novo">Cadastrar primeiro empréstimo</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Input
          placeholder="Buscar por nome do devedor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Tabs defaultValue="ativos">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">
            Todos{todos.length > 0 && <span className="ml-2 rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs font-semibold">{todos.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="ativos">
            Ativos{ativos.length > 0 && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{ativos.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="quitados">
            Quitados{quitados.length > 0 && <span className="ml-2 rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs font-semibold">{quitados.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <ListaTabela emprestimos={todos} vazio="Nenhum empréstimo encontrado." onDelete={(e) => setParaDeletar(e)} />
        </TabsContent>

        <TabsContent value="ativos">
          <ListaTabela emprestimos={ativos} vazio="Nenhum empréstimo ativo." onDelete={(e) => setParaDeletar(e)} />
        </TabsContent>

        <TabsContent value="quitados">
          <ListaTabela emprestimos={quitados} vazio="Nenhum empréstimo quitado." onDelete={(e) => setParaDeletar(e)} />
        </TabsContent>
      </Tabs>

      <ConfirmModal
        open={!!paraDeletar}
        onOpenChange={(o) => !o && setParaDeletar(null)}
        title={`Excluir empréstimo de ${paraDeletar?.nome_pessoa}?`}
        description="Esta ação não pode ser desfeita. Todas as parcelas serão removidas."
        confirmText="Sim, excluir"
        variant="destructive"
        onConfirm={async () => { if (paraDeletar) await onDelete(paraDeletar.id); }}
      />
    </>
  );
}

function ListaTabela({
  emprestimos,
  vazio,
  onDelete,
}: {
  emprestimos: EmprestimoComResumo[];
  vazio: string;
  onDelete: (e: EmprestimoComResumo) => void;
}) {
  return (
    <>
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Devedor</TableHead>
                <TableHead className="text-right">Valor emprestado</TableHead>
                <TableHead className="text-center">Parcelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emprestimos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {vazio}
                  </TableCell>
                </TableRow>
              ) : (
                emprestimos.map((e) => {
                  const totalParcelas = e.parcelas?.length ?? e.numero_parcelas;
                  const pagas = e.parcelas?.filter((p) => p.data_pagamento).length ?? 0;
                  const temAtraso = e.parcelas?.some(
                    (p) => calcularStatusParcela(p.data_vencimento, p.data_pagamento) === "atrasado"
                  ) ?? false;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          {e.status === "quitado" && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                          {e.nome_pessoa}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(Number(e.valor_emprestado))}</TableCell>
                      <TableCell className="text-center">{pagas}/{totalParcelas}</TableCell>
                      <TableCell><EmprestimoStatusBadge status={e.status} temAtraso={temAtraso} /></TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button asChild variant="ghost" size="icon" title="Ver detalhes">
                            <Link href={`/dashboard/icobra/emprestimos/${e.id}`}><Eye className="h-5 w-5" /></Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" title="Editar">
                            <Link href={`/dashboard/icobra/emprestimos/${e.id}/editar`}><Pencil className="h-5 w-5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" title="Excluir" onClick={() => onDelete(e)}>
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {emprestimos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">{vazio}</CardContent>
          </Card>
        ) : (
          emprestimos.map((e) => {
            const totalParcelas = e.parcelas?.length ?? e.numero_parcelas;
            const pagas = e.parcelas?.filter((p) => p.data_pagamento).length ?? 0;
            const temAtraso = e.parcelas?.some(
              (p) => calcularStatusParcela(p.data_vencimento, p.data_pagamento) === "atrasado"
            ) ?? false;
            return (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/dashboard/icobra/emprestimos/${e.id}`} className="flex items-center gap-1.5 truncate text-lg font-semibold hover:underline">
                        {e.status === "quitado" && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                        {e.nome_pessoa}
                      </Link>
                      <p className="text-base tabular-nums">{formatCurrency(Number(e.valor_emprestado))}</p>
                    </div>
                    <EmprestimoStatusBadge status={e.status} temAtraso={temAtraso} />
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{pagas} de {totalParcelas} parcelas pagas</p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/dashboard/icobra/emprestimos/${e.id}`}>Detalhes</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/dashboard/icobra/emprestimos/${e.id}/editar`}>Editar</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(e)} title="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
