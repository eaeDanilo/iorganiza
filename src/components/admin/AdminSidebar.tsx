'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, Users, BarChart3, Webhook, Settings, ScrollText } from 'lucide-react';

const items = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/saas', label: 'SaaS', icon: Package },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-2xl font-bold text-white shadow-glow-coral">
          iO
        </div>
        <p className="mt-3 text-xs uppercase tracking-widest text-secondary">Admin</p>
      </div>
      <div className="mb-6 h-px bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60" />
      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || (it.href !== '/admin' && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-gradient-to-r from-secondary/20 to-primary/10 text-foreground shadow-glow-coral'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
      <AdminSidebarContent />
    </aside>
  );
}
