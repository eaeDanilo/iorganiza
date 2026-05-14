// Navbar plug-and-play para SaaS filho — mostra link de volta ao Hub + logout.
'use client';

import * as React from 'react';
import { Button } from './components';

export interface IorganizaNavbarProps {
  saasName: string;
  userEmail?: string | null;
  hubUrl?: string;
  onLogout?: () => void | Promise<void>;
}

export function IorganizaNavbar({ saasName, userEmail, hubUrl = '/', onLogout }: IorganizaNavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href={hubUrl} className="text-sm text-muted-foreground hover:text-foreground">
            ← iOrganiza
          </a>
          <span className="text-xl font-bold text-primary">{saasName}</span>
        </div>
        <div className="flex items-center gap-3">
          {userEmail && <span className="text-sm text-muted-foreground">{userEmail}</span>}
          {onLogout && (
            <Button variant="ghost" size="sm" onClick={() => onLogout()}>
              Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
