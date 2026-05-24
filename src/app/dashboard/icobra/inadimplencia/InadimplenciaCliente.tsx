"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/icobra/ConfirmModal";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { hoje } from "@/lib/icobra/calculos";
import { marcarParcelaPaga } from "../emprestimos/actions";
import type { InadimplenteItem } from "@/lib/icobra/types";

type FaixaAtraso = "todos" | "1-7" | "8-30" | "30+";

export function InadimplenciaCliente({ items }: { items: InadimplenteItem[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busca, setBusca] = useState("");
  const [faixa, setFaixa] = useState<FaixaAtraso>("todos");
  const [paraMarcar, setParaMarcar] = useState<InadimplenteItem | null>(null);
  const [dataPagamento, setDataPagamento] = useState(hoje());

  const filtrados = useMemo(() => {
    return items.filter((i) => {
      if (busca && !i.nome_pessoa.toLowerCase().includes(busca.toLowerCase())) return false;
      if (faixa === "1-7" && (i.dias_atraso < 1 || i.dias_atraso > 7)) return false;
      if (faixa === "8-30" && (i.dias_atraso < 8 || i.dias_atraso > 30)) return false;
      if (faixa === "30+" && i.dias_atraso <= 30) return false;
      return true;
    });
  }, [items, busca, faixa]);

  async function handleMarcarPago() {
    if (!paraMarcar) return;
    try {
      await marcarParcelaPaga(paraMarcar.parcela_id, dataPagamento);
      toast.success("Pagamento registrado!");
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar.");
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 text-lg font-medium">Você não tem parcelas em atraso!</p>
          <p className="text-muted-foreground">Todos os pagamentos em dia.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_220px]">
        <Input
          placeholder="Buscar por nome do devedor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Select value={faixa} onValueChange={(v) => setFaixa(v as FaixaAtraso)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as faixas</SelectItem>
            <SelectItem value="1-7">1 a 7 dias</SelectItem>
            <SelectItem value="8-30">8 a 30 dias</SelectItem>
            <SelectItem value="30+">Mais de 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtrados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum resultado para os filtros aplicados.
            </CardContent>
          </Card>
        ) : (
          filtrados.map((i) => {
            const critico = i.dias_atraso > 7;
            return (
              <Card key={i.parcela_id} className={critico ? "border-destructive/50" : "border-yellow-500/30"}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/icobra/emprestimos/${i.emprestimo_id}`}
                      className="block truncate text-lg font-semibold hover:underline"
                    >
                      {i.nome_pessoa}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>Vencimento: {formatDate(i.data_vencimento)}</span>
                      <span>•</span>
                      <Badge variant={critico ? "destructive" : "warning"}>
                        {i.dias_atraso} {i.dias_atraso === 1 ? "dia" : "dias"} de atraso
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold tabular-nums text-destructive">
                      {formatCurrency(i.valor)}
                    </span>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => { setParaMarcar(i); setDataPagamento(hoje()); }}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Pagar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmModal
        open={!!paraMarcar}
        onOpenChange={(o) => !o && setParaMarcar(null)}
        title="Marcar parcela como paga?"
        description={paraMarcar ? `${paraMarcar.nome_pessoa} — ${formatCurrency(paraMarcar.valor)}` : ""}
        confirmText="Confirmar pagamento"
        onConfirm={handleMarcarPago}
      >
        <div className="space-y-2">
          <Label>Data do pagamento</Label>
          <DatePicker value={dataPagamento} onChange={setDataPagamento} />
        </div>
      </ConfirmModal>
    </>
  );
}
