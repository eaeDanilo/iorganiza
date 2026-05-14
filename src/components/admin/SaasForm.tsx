'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Saas } from '@/types/database';

type Props = { initial?: Partial<Saas>; mode: 'create' | 'edit' };

export function SaasForm({ initial, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get('name')),
      slug: String(fd.get('slug')),
      description: String(fd.get('description') || ''),
      logo_url: String(fd.get('logo_url') || '') || null,
      banner_url: String(fd.get('banner_url') || '') || null,
      external_url: String(fd.get('external_url') || '') || null,
      price_monthly: Number(fd.get('price_monthly')),
      features: String(fd.get('features') || '').split('\n').map((s) => s.trim()).filter(Boolean),
      status: fd.get('status') === 'active' ? 'active' : 'inactive',
      stripe_price_id: String(fd.get('stripe_price_id') || '') || null,
      stripe_product_id: String(fd.get('stripe_product_id') || '') || null,
    };
    const url = mode === 'create' ? '/api/saas' : `/api/saas/${initial?.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    setLoading(false);
    if (!j.ok) { setError(j.error?.message || 'Erro'); return; }
    router.push('/admin/saas');
    router.refresh();
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!confirm('Excluir este SaaS?')) return;
    setLoading(true);
    await fetch(`/api/saas/${initial.id}`, { method: 'DELETE' });
    router.push('/admin/saas');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle>{mode === 'create' ? 'Novo SaaS' : `Editar ${initial?.name}`}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={initial?.name ?? ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={initial?.slug ?? ''} required pattern="[a-z0-9-]+" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={initial?.description ?? ''} rows={3} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL do logo</Label>
              <Input id="logo_url" name="logo_url" defaultValue={initial?.logo_url ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_url">URL do banner</Label>
              <Input id="banner_url" name="banner_url" defaultValue={initial?.banner_url ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price_monthly">Preço mensal (R$)</Label>
              <Input id="price_monthly" name="price_monthly" type="number" step="0.01" defaultValue={initial?.price_monthly ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={initial?.status ?? 'active'} className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_url">URL externa (para SaaS hospedado fora)</Label>
            <Input id="external_url" name="external_url" defaultValue={initial?.external_url ?? ''} placeholder="https://app.icobra.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (uma por linha)</Label>
            <Textarea id="features" name="features" rows={5} defaultValue={Array.isArray(initial?.features) ? (initial!.features as string[]).join('\n') : ''} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
              <Input id="stripe_product_id" name="stripe_product_id" defaultValue={initial?.stripe_product_id ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
              <Input id="stripe_price_id" name="stripe_price_id" defaultValue={initial?.stripe_price_id ?? ''} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            {mode === 'edit' && (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={loading}>Excluir</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
