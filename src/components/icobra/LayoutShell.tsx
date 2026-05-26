"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ICobraSidebar, ICobraSidebarContent } from "./Sidebar";
import { SplashScreen } from "@/components/shared/SplashScreen";

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
    <>
      <SplashScreen systemKey="icobra" bg="bg-[#0C1A10]">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00C853] shadow-[0_0_40px_rgba(0,200,83,0.4)]">
            <svg width="32" height="32" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#0C1A10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-bold tracking-tight text-white">Painel de controle</span>
            <span className="text-sm text-white/40">de empréstimos e cobranças</span>
          </div>
        </div>
      </SplashScreen>
    <div className="flex min-h-screen bg-[#0C1A10]">
      <ICobraSidebar />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="border-white/[0.07] bg-[#0B1810] p-0">
          <SheetTitle className="sr-only">Menu iCobra</SheetTitle>
          <ICobraSidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0C1A10] px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white transition-colors md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#00C853]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#0C1A10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-white">iCobra</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/30 md:block">{userEmail}</span>
            {logoutButton}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
    </>
  );
}
