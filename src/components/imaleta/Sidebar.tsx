"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  Briefcase,
  ScanBarcode,
  ArrowLeft,
} from "lucide-react";

const BG = "#181818";
const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";

const items = [
  { href: "/dashboard/imaleta", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/imaleta/vendedores", label: "Vendedores", icon: Users, exact: false },
  { href: "/dashboard/imaleta/produtos", label: "Produtos", icon: Package, exact: false },
  { href: "/dashboard/imaleta/maletas", label: "Maletas", icon: Briefcase, exact: false },
  { href: "/dashboard/imaleta/conferencia", label: "Conferência", icon: ScanBarcode, exact: false },
];

export function IMaletaSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col" style={{ background: BG }}>
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded"
          style={{ background: ACCENT }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="7" width="16" height="11" rx="2" stroke={BG} strokeWidth="2" />
            <path d="M7 7V5a3 3 0 016 0v2" stroke={BG} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-white">iMaleta</span>
      </div>

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
                !active && "hover:bg-white/[0.05]"
              )}
              style={
                active
                  ? { background: "rgba(222,218,211,0.1)", color: ACCENT }
                  : { color: "rgba(255,255,255,0.45)" }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.05]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Voltar ao iOrganiza
        </Link>
      </div>
    </div>
  );
}

export function IMaletaSidebar() {
  return (
    <aside
      className="hidden w-60 shrink-0 md:flex md:flex-col"
      style={{ borderRight: `1px solid ${BORDER}` }}
    >
      <IMaletaSidebarContent />
    </aside>
  );
}
