"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Banknote, AlertTriangle, ArrowLeft, Bot } from "lucide-react";

const items = [
  { href: "/dashboard/icobra", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/icobra/emprestimos", label: "Empréstimos", icon: Banknote, exact: false },
  { href: "/dashboard/icobra/inadimplencia", label: "Inadimplência", icon: AlertTriangle, exact: false },
  { href: "/dashboard/icobra/assistente", label: "Assistente IA", icon: Bot, exact: false },
];

export function ICobraSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white shadow-lg">
          iC
        </div>
        <p className="mt-2 text-base font-semibold">iCobra</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Gestão de Empréstimos
        </p>
      </div>

      <div className="mb-6 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact
            ? pathname === it.href
            : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-emerald-500/10 font-medium text-emerald-400"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao iOrganiza
        </Link>
      </div>
    </div>
  );
}

export function ICobraSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
      <ICobraSidebarContent />
    </aside>
  );
}
