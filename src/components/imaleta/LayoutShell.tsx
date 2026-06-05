"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { IMaletaSidebar, IMaletaSidebarContent } from "./Sidebar";
import { SplashScreen } from "@/components/shared/SplashScreen";

const BG = "#181818";
const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";

interface Props {
  children: React.ReactNode;
  userEmail: string;
  logoutButton: React.ReactNode;
}

export function IMaletaLayoutShell({ children, userEmail, logoutButton }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <SplashScreen systemKey="imaleta" bg="bg-[#181818]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: ACCENT,
              boxShadow: "0 0 40px rgba(222,218,211,0.15)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="7" width="16" height="11" rx="2" stroke={BG} strokeWidth="2" />
              <path d="M7 7V5a3 3 0 016 0v2" stroke={BG} strokeWidth="2" strokeLinecap="round" />
              <path d="M7 12h6" stroke={BG} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-bold tracking-tight text-white">
              Painel de controle
            </span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              de maletas e vendas externas
            </span>
          </div>
        </div>
      </SplashScreen>

      <div className="flex min-h-screen" style={{ background: BG }}>
        <IMaletaSidebar />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="p-0"
            style={{ borderColor: BORDER, background: "#141414" }}
          >
            <SheetTitle className="sr-only">Menu iMaleta</SheetTitle>
            <IMaletaSidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="flex h-14 shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6"
            style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06] md:hidden"
                style={{ color: "rgba(255,255,255,0.4)" }}
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{ background: ACCENT }}
                >
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="7" width="16" height="11" rx="2" stroke={BG} strokeWidth="2.5" />
                    <path
                      d="M7 7V5a3 3 0 016 0v2"
                      stroke={BG}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold text-white">iMaleta</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="hidden text-xs md:block"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {userEmail}
              </span>
              {logoutButton}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
