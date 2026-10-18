"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

export type GameDayAction = {
  label: string;
  href: string;
  tone?: "default" | "watch";
};

const DEFAULT_ACTION: GameDayAction = { label: "Sign in", href: "/login", tone: "default" };

const GameDayActionContext = createContext<((action: GameDayAction) => void) | null>(null);

export function useGameDayAction(label: string, href: string, tone: "default" | "watch" = "default") {
  const setAction = useContext(GameDayActionContext);
  useEffect(() => {
    setAction?.({ label, href, tone });
    return () => setAction?.(DEFAULT_ACTION);
  }, [setAction, label, href, tone]);
}

export function GameDayChrome({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<GameDayAction>(DEFAULT_ACTION);
  return (
    <GameDayActionContext.Provider value={setAction}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0f0c]">
        <div className="mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 xl:px-6">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2 font-display text-[1.35rem] tracking-wide text-white"
          >
            <BrandMark className="h-7 w-7 shrink-0" size={28} priority />
            <span className="truncate">
              LEAGUE <span className="text-[#C6FF00]">SPORTS</span>
            </span>
          </Link>
          {action.tone === "watch" ? (
            <span className="inline-flex shrink-0 items-center rounded-full bg-[#C6FF00] px-3 py-1.5 text-xs font-semibold text-zinc-950">
              {action.label}
            </span>
          ) : (
            <Link
              href={action.href}
              className="inline-flex shrink-0 items-center rounded-full border border-white/40 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {action.label}
            </Link>
          )}
        </div>
      </header>
      {children}
    </GameDayActionContext.Provider>
  );
}
