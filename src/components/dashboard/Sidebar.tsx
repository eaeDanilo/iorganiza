'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, ShoppingBag, Receipt, User } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/meus-saas', label: 'Meus SaaS', icon: Package },
  { href: '/dashboard/catalogo', label: 'Catálogo', icon: ShoppingBag },
  { href: '/dashboard/faturamento', label: 'Faturamento', icon: Receipt },
  { href: '/dashboard/perfil', label: 'Perfil', icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-border bg-background p-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-2xl font-bold text-white shadow-glow">
          iO
        </div>
        <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">iOrganiza</p>
      </div>
      <div className="mb-6 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-gradient-stat text-foreground shadow-glow'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
