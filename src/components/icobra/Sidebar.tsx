"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Banknote, AlertTriangle, ArrowLeft, Bot, Trash2 } from "lucide-react";

const items = [
  { href: "/dashboard/icobra", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/icobra/emprestimos", label: "Empréstimos", icon: Banknote, exact: false },
  { href: "/dashboard/icobra/inadimplencia", label: "Inadimplência", icon: AlertTriangle, exact: false },
  { href: "/dashboard/icobra/assistente", label: "Assistente IA", icon: Bot, exact: false },
  { href: "/dashboard/icobra/lixeira", label: "Lixeira", icon: Trash2, exact: false },
];

export function ICobraSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#0B1810]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#00C853]">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5L5.5 10L11 3" stroke="#0B1810" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-white">iCobra</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[#00C853]/10 font-medium text-[#00C853]"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Back */}
      <div className="border-t border-white/[0.07] px-3 py-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Voltar ao iOrganiza
        </Link>
      </div>
    </div>
  );
}

export function ICobraSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/[0.07] md:flex md:flex-col">
      <ICobraSidebarContent />
    </aside>
  );
}
