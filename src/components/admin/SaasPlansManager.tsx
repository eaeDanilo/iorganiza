'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { SaasPlan } from '@/types/database';

type Props = { saasId: string; initialPlans: SaasPlan[] };

const EMPTY_FORM = {
  name: '', slug: '', description: '', price_monthly: '',
  features: '', stripe_price_id: '', has_ai_chat: false, is_default: false, sort_order: '0',
};

export function SaasPlansManager({ saasId, initialPlans }: Props) {
  const [plans, setPlans] = useState<SaasPlan[]>(initialPlans);
  const [editing, setEditing] = useState<SaasPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setCreating(true);
  }

  function openEdit(plan: SaasPlan) {
    setCreating(false);
    setEditing(plan);
    setError(null);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? '',
      price_monthly: String(plan.price_monthly),
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      stripe_price_id: plan.stripe_price_id ?? '',
      has_ai_chat: plan.has_ai_chat,
      is_default: plan.is_default,
      sort_order: String(plan.sort_order),
    });
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  function buildBody() {
    return {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price_monthly: Number(form.price_monthly),
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      stripe_price_id: form.stripe_price_id || null,
      has_ai_chat: form.has_ai_chat,
      is_default: form.is_default,
      sort_order: Number(form.sort_order),
    };
  }

  async function onSave() {
    setLoading(true);
    setError(null);
    const isEdit = !!editing;
    const url = isEdit
      ? `/api/saas/${saasId}/plans/${editing!.id}`
      : `/api/saas/${saasId}/plans`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildBody()),
    });
    const j = await res.json();
    setLoading(false);
    if (!j.ok) { setError(j.error?.message || 'Erro ao salvar'); return; }
    if (isEdit) {
      setPlans((prev) => prev.map((p) => (p.id === editing!.id ? j.data : p)));
    } else {
      setPlans((prev) => [...prev, j.data]);
    }
    cancelForm();
  }

  async function onDelete(planId: string) {
    setLoading(true);
    await fetch(`/api/saas/${saasId}/plans/${planId}`, { method: 'DELETE' });
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setLoading(false);
    setConfirmPlanId(null);
  }

  const showForm = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Planos</h2>
        {!showForm && (
          <Button size="sm" onClick={openCreate}>+ Novo plano</Button>
        )}
      </div>

      {plans.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          Nenhum plano criado. Sem planos, o produto exibe um preço único.
        </p>
      )}

      {plans.length > 0 && (
        <div className="grid gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(plan.price_monthly)}/mês</p>
                </div>
                {plan.has_ai_chat && <Badge variant="outline" className="text-xs">IA</Badge>}
                {plan.is_default && <Badge variant="secondary" className="text-xs">Padrão</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>Editar</Button>
                {confirmPlanId === plan.id ? (
                  <div className="flex items-center gap-1 rounded border border-destructive/40 bg-destructive/5 px-2 py-1">
                    <span className="text-xs text-muted-foreground">Excluir?</span>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(plan.id)} disabled={loading} className="h-6 px-2 text-xs">Sim</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmPlanId(null)} disabled={loading} className="h-6 px-2 text-xs">Não</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmPlanId(plan.id)} disabled={loading}>Excluir</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold">{editing ? `Editar: ${editing.name}` : 'Novo plano'}</h3>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Pro" />
            </div>
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="ex: pro" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Descrição (opcional)</Label>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Preço mensal (R$)</Label>
              <Input type="number" step="0.01" value={form.price_monthly} onChange={(e) => setForm((f) => ({ ...f, price_monthly: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Stripe Price ID</Label>
              <Input value={form.stripe_price_id} onChange={(e) => setForm((f) => ({ ...f, stripe_price_id: e.target.value }))} placeholder="price_..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Funcionalidades (uma por linha)</Label>
            <Textarea rows={4} value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Ordem de exibição</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_ai_chat}
                onChange={(e) => setForm((f) => ({ ...f, has_ai_chat: e.target.checked }))}
                className="h-4 w-4"
              />
              Inclui assistente IA
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="h-4 w-4"
              />
              Plano padrão
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button variant="outline" onClick={cancelForm} disabled={loading}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
