"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar, AdminSidebarContent } from "./AdminSidebar";

interface Props {
  children: React.ReactNode;
  userEmail: string;
  logoutButton: React.ReactNode;
}

export function AdminLayoutShell({ children, userEmail, logoutButton }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Menu admin</SheetTitle>
          <AdminSidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex h-16 items-center justify-between overflow-hidden border-b border-border px-4 sm:h-20 sm:px-6 md:px-8">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary opacity-90" />
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
            <Link href="/admin" className="text-lg font-bold text-white drop-shadow sm:text-xl">
              Painel Admin
            </Link>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[180px] truncate rounded-full bg-black/30 px-3 py-1.5 text-xs text-white backdrop-blur sm:inline-block sm:max-w-[260px] sm:px-4 sm:text-sm">
              {userEmail}
            </span>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/30 bg-black/20 text-white backdrop-blur hover:bg-black/40"
            >
              <Link href="/dashboard">Painel usuário</Link>
            </Button>
            {logoutButton}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
