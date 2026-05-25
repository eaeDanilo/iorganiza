"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ParcelaStatusBadge } from "@/components/icobra/StatusBadge";
import { ConfirmModal } from "@/components/icobra/ConfirmModal";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { calcularStatusParcela, hoje } from "@/lib/icobra/calculos";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Parcela } from "@/lib/icobra/types";

interface ParcelaTabelaProps {
  parcelas: Parcela[];
  onMarcarPago: (parcelaId: string, dataPagamento: string) => Promise<void>;
  onDesmarcarPago: (parcelaId: string) => Promise<void>;
}

export function ParcelaTabela({ parcelas, onMarcarPago, onDesmarcarPago }: ParcelaTabelaProps) {
  const [paraMarcar, setParaMarcar] = useState<Parcela | null>(null);
  const [paraDesmarcar, setParaDesmarcar] = useState<Parcela | null>(null);
  const [dataPagamento, setDataPagamento] = useState(hoje());
  const ordenadas = [...parcelas].sort((a, b) => a.numero - b.numero);

  return (
    <>
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenadas.map((p) => {
                const status = calcularStatusParcela(p.data_vencimento, p.data_pagamento);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.numero}</TableCell>
                    <TableCell>{formatDate(p.data_vencimento)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.data_pagamento ? formatDate(p.data_pagamento) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(Number(p.valor))}</TableCell>
                    <TableCell><ParcelaStatusBadge status={status} /></TableCell>
                    <TableCell className="text-right">
                      {!p.data_pagamento ? (
                        <Button size="sm" variant="success" onClick={() => { setParaMarcar(p); setDataPagamento(hoje()); }}>
                          <Check className="mr-1 h-4 w-4" />
                          Marcar pago
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setParaDesmarcar(p)}>
                          <X className="mr-1 h-4 w-4" />
                          Desfazer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {ordenadas.map((p) => {
          const status = calcularStatusParcela(p.data_vencimento, p.data_pagamento);
          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Parcela {p.numero}</p>
                    <p className="text-sm text-muted-foreground">Venc: {formatDate(p.data_vencimento)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold tabular-nums">{formatCurrency(Number(p.valor))}</span>
                    <ParcelaStatusBadge status={status} />
                  </div>
                </div>
                {!p.data_pagamento ? (
                  <Button size="sm" variant="success" className="w-full" onClick={() => { setParaMarcar(p); setDataPagamento(hoje()); }}>
                    <Check className="mr-1 h-4 w-4" />
                    Marcar pago
                  </Button>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-success">Pago em {formatDate(p.data_pagamento)}</p>
                    <Button size="sm" variant="outline" onClick={() => setParaDesmarcar(p)}>
                      <X className="mr-1 h-4 w-4" />
                      Desfazer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        open={!!paraMarcar}
        onOpenChange={(o) => !o && setParaMarcar(null)}
        title="Marcar parcela como paga?"
        description={paraMarcar ? `Parcela ${paraMarcar.numero} — ${formatCurrency(Number(paraMarcar.valor))}` : ""}
        confirmText="Confirmar pagamento"
        onConfirm={async () => { if (paraMarcar) await onMarcarPago(paraMarcar.id, dataPagamento); }}
      >
        <div className="space-y-2">
          <Label>Data do pagamento</Label>
          <DatePicker value={dataPagamento} onChange={setDataPagamento} />
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={!!paraDesmarcar}
        onOpenChange={(o) => !o && setParaDesmarcar(null)}
        title="Desfazer pagamento?"
        description={paraDesmarcar ? `Parcela ${paraDesmarcar.numero} voltará para pendente.` : ""}
        confirmText="Sim, desfazer"
        variant="destructive"
        onConfirm={async () => { if (paraDesmarcar) await onDesmarcarPago(paraDesmarcar.id); }}
      />
    </>
  );
}
