"use client";

import { useEffect, useState } from "react";

interface Props {
  systemKey: string;
  bg: string;
  children: React.ReactNode;
}

export function SplashScreen({ systemKey, bg, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const key = `splash:${systemKey}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    setVisible(true);
    const exitStart = setTimeout(() => setExiting(true), 1300);
    const done = setTimeout(() => setVisible(false), 1900);

    return () => {
      clearTimeout(exitStart);
      clearTimeout(done);
      // Strict Mode double-invokes effects: remove key so the real mount reschedules timers
      sessionStorage.removeItem(key);
    };
  }, [systemKey]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${bg}`}
      style={{
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 600ms ease-out" : undefined,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
        {children}
      </div>
    </div>
  );
}
