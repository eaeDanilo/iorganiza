"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCalculoEmprestimo } from "@/components/icobra/useCalculoEmprestimo";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { hoje } from "@/lib/icobra/calculos";
import type { DiasPagamento, EmprestimoFormData, Frequencia, TipoRetorno } from "@/lib/icobra/types";

interface EmprestimoFormProps {
  initialData?: Partial<EmprestimoFormData>;
  onSubmit: (data: EmprestimoFormData) => void;
  submitLabel?: string;
  isEdicao?: boolean;
}

export function EmprestimoForm({ initialData, onSubmit, submitLabel = "Continuar para revisão", isEdicao }: EmprestimoFormProps) {
  const [data, setData] = useState<Partial<EmprestimoFormData>>({
    nome_pessoa: "",
    valor_emprestado: undefined,
    tipo_retorno: "valor_fixo",
    frequencia: "mensal",
    numero_parcelas: undefined,
    data_primeiro_pagamento: hoje(),
    dias_pagamento: "todos_dias",
    ...initialData,
  });

  const calculo = useCalculoEmprestimo(data);

  function update<K extends keyof EmprestimoFormData>(key: K, value: EmprestimoFormData[K] | undefined) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar(data)) return;
    onSubmit(data as EmprestimoFormData);
  }

  const valido = validar(data);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Quem está pegando o empréstimo?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="nome_pessoa">Nome do devedor</Label>
              <Input
                id="nome_pessoa"
                value={data.nome_pessoa ?? ""}
                onChange={(e) => update("nome_pessoa", e.target.value)}
                placeholder="Ex: João da Silva"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Quanto e como vai cobrar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valor_emprestado">Valor emprestado (R$)</Label>
              <Input
                id="valor_emprestado"
                type="number"
                step="0.01"
                min="0.01"
                value={data.valor_emprestado ?? ""}
                onChange={(e) => update("valor_emprestado", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1000,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de retorno</Label>
              <RadioToggle
                value={data.tipo_retorno ?? "valor_fixo"}
                onChange={(v) => update("tipo_retorno", v as TipoRetorno)}
                options={[
                  { value: "valor_fixo", label: "Valor fixo da parcela" },
                  { value: "percentual", label: "Percentual sobre o valor" },
                ]}
              />
            </div>

            {data.tipo_retorno === "valor_fixo" ? (
              <div className="space-y-2">
                <Label htmlFor="valor_parcela_input">Valor de cada parcela (R$)</Label>
                <Input
                  id="valor_parcela_input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={data.valor_parcela_input ?? ""}
                  onChange={(e) => update("valor_parcela_input", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="100,00"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="percentual">Percentual sobre o valor (%)</Label>
                <Input
                  id="percentual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.percentual ?? ""}
                  onChange={(e) => update("percentual", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="10"
                  required
                />
                <p className="text-sm text-muted-foreground">Ex: 10 = 10% sobre o valor emprestado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Como será o parcelamento?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência</Label>
              <Select value={data.frequencia} onValueChange={(v) => update("frequencia", v as Frequencia)}>
                <SelectTrigger id="frequencia"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_parcelas">Quantidade de parcelas</Label>
              <Input
                id="numero_parcelas"
                type="number"
                min="1"
                step="1"
                value={data.numero_parcelas ?? ""}
                onChange={(e) => update("numero_parcelas", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data do primeiro pagamento</Label>
              <DatePicker
                value={data.data_primeiro_pagamento}
                onChange={(d) => update("data_primeiro_pagamento", d)}
              />
            </div>

            <div className="space-y-2">
              <Label>Dias de pagamento</Label>
              <RadioToggle
                value={data.dias_pagamento ?? "todos_dias"}
                onChange={(v) => update("dias_pagamento", v as DiasPagamento)}
                options={[
                  { value: "todos_dias", label: "Todos os dias" },
                  { value: "dias_uteis", label: "Apenas dias úteis" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {isEdicao && (
          <div className="rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-400">
            <strong>Atenção:</strong> Ao editar, parcelas não pagas serão recalculadas.
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={!valido}>
          {submitLabel}
        </Button>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Atualiza enquanto você preenche.</CardDescription>
          </CardHeader>
          <CardContent>
            {!calculo ? (
              <p className="text-sm text-muted-foreground">Preencha os campos para ver o cálculo.</p>
            ) : (
              <div className="space-y-4">
                <ResumoLinha label="Valor de cada parcela" value={formatCurrency(calculo.valor_parcela)} destaque />
                <ResumoLinha label="Total a receber" value={formatCurrency(calculo.total_a_receber)} />
                <ResumoLinha label="Lucro" value={formatCurrency(calculo.lucro)} className="text-success" />

                {calculo.datas_vencimento.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Próximos vencimentos</p>
                    <ul className="space-y-1 text-sm">
                      {calculo.datas_vencimento.slice(0, 3).map((d, i) => (
                        <li key={d} className="flex justify-between">
                          <span className="text-muted-foreground">Parcela {i + 1}</span>
                          <span className="font-medium tabular-nums">{formatDate(d)}</span>
                        </li>
                      ))}
                      {calculo.datas_vencimento.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          + {calculo.datas_vencimento.length - 3} parcelas
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function ResumoLinha({ label, value, destaque, className }: { label: string; value: string; destaque?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${destaque ? "text-xl font-bold text-primary" : "font-semibold"} ${className ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

function RadioToggle({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex w-full items-center justify-center rounded-md border bg-background p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function validar(d: Partial<EmprestimoFormData>): boolean {
  if (!d.nome_pessoa?.trim()) return false;
  if (!d.valor_emprestado || d.valor_emprestado <= 0) return false;
  if (!d.numero_parcelas || d.numero_parcelas <= 0) return false;
  if (!d.data_primeiro_pagamento) return false;
  if (d.tipo_retorno === "valor_fixo") {
    if (!d.valor_parcela_input || d.valor_parcela_input <= 0) return false;
  } else if (d.tipo_retorno === "percentual") {
    if (d.percentual === undefined || d.percentual < 0) return false;
  }
  return true;
}
