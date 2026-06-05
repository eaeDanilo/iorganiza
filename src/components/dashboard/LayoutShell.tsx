"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";
import { DashboardSidebar, DashboardSidebarContent } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SplashScreen } from "@/components/shared/SplashScreen";

const SAAS_PREFIXES = ["/dashboard/icobra", "/dashboard/imaleta"];

interface Props {
  children: React.ReactNode;
  userEmail: string;
  isAdmin: boolean;
  logoutButton: React.ReactNode;
  activeSaas: { slug: string; name: string }[];
}

export function LayoutShell({ children, userEmail, isAdmin, logoutButton, activeSaas }: Props) {
  const pathname = usePathname();
  const isSaas = SAAS_PREFIXES.some((p) => pathname.startsWith(p));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isSaas) {
    return (
      <>
        {children}
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <SplashScreen systemKey="iorganiza" bg="bg-background">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-hero text-4xl font-bold text-white shadow-glow">
          iO
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          iOrganiza
        </p>
      </SplashScreen>
    <div className="flex min-h-screen">
      <DashboardSidebar activeSaas={activeSaas} />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <DashboardSidebarContent activeSaas={activeSaas} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex h-16 items-center justify-between overflow-hidden border-b border-border px-4 sm:h-20 sm:px-6 md:px-8">
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

          <div className="relative flex items-center gap-2 sm:gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="text-white hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="text-lg font-bold text-white drop-shadow sm:text-xl">
              Painel
            </Link>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[180px] truncate rounded-full bg-black/30 px-3 py-1.5 text-xs text-white backdrop-blur sm:inline-block sm:max-w-[260px] sm:px-4 sm:text-sm">
              {userEmail}
            </span>
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/30 bg-black/20 text-white backdrop-blur hover:bg-black/40"
              >
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            {logoutButton}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
    </>
  );
}
