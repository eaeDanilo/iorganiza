'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Package, ShoppingBag, Receipt, User, Banknote, Briefcase, AppWindow } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/meus-saas', label: 'Meus Sistemas', icon: Package },
  { href: '/dashboard/catalogo', label: 'Catálogo', icon: ShoppingBag },
  { href: '/dashboard/faturamento', label: 'Faturamento', icon: Receipt },
  { href: '/dashboard/perfil', label: 'Perfil', icon: User },
];

const SAAS_SLUG_CONFIG: Record<string, { href: string; icon: LucideIcon }> = {
  icobra: { href: '/dashboard/icobra', icon: Banknote },
  imaleta: { href: '/dashboard/imaleta', icon: Briefcase },
};

interface SidebarProps {
  activeSaas: { slug: string; name: string }[];
  onNavigate?: () => void;
}

export function DashboardSidebarContent({ activeSaas, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col p-6">
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
              onClick={onNavigate}
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
      {activeSaas.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Meus Apps
          </p>
          <nav className="space-y-1">
            {activeSaas.map((saas) => {
              const config = SAAS_SLUG_CONFIG[saas.slug] ?? { href: `/dashboard/${saas.slug}`, icon: AppWindow };
              const Icon = config.icon;
              const active = pathname.startsWith(config.href);
              return (
                <Link
                  key={saas.slug}
                  href={config.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                    active
                      ? 'bg-gradient-stat text-foreground shadow-glow'
                      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {saas.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar({ activeSaas }: { activeSaas: { slug: string; name: string }[] }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
      <DashboardSidebarContent activeSaas={activeSaas} />
    </aside>
  );
}
