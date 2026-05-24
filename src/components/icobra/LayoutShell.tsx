"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ICobraSidebar, ICobraSidebarContent } from "./Sidebar";

interface Props {
  children: React.ReactNode;
  userEmail: string;
  logoutButton: React.ReactNode;
}

export function ICobraLayoutShell({ children, userEmail, logoutButton }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <ICobraSidebar />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Menu iCobra</SheetTitle>
          <ICobraSidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:h-16 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
              iC
            </div>
            <span className="truncate font-semibold">iCobra</span>
            <span className="hidden text-sm text-muted-foreground sm:block">
              — Gestão de Empréstimos
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground md:block">
              {userEmail}
            </span>
            {logoutButton}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
