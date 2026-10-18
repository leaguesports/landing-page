"use client";

import Link from "next/link";
import { Eye, List, Pencil } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

export type GameDayAction = {
  label: string;
  href: string;
  tone?: "default" | "watch" | "account";
  /** Desktop leaderboard shows the sport links beside the action. */
  sports?: boolean;
};

const DEFAULT_ACTION: GameDayAction = { label: "Sign in", href: "/login", tone: "default" };

const SPORT_LINKS = [
  { label: "Soccer", href: "/watch/soccer" },
  { label: "Rugby", href: "/watch/rugby" },
  { label: "Cricket", href: "/watch/cricket" },
  { label: "Golf", href: "/play/golf" },
  { label: "Venues", href: "/venues" },
];

const GameDayActionContext = createContext<((action: GameDayAction) => void) | null>(null);

export function useGameDayAction(
  label: string,
  href: string,
  tone: "default" | "watch" | "account" = "default",
  sports = false,
) {
  const setAction = useContext(GameDayActionContext);
  useEffect(() => {
    setAction?.({ label, href, tone, sports });
    return () => setAction?.(DEFAULT_ACTION);
  }, [setAction, label, href, tone, sports]);
}

const headerPillClass =
  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/45 bg-[#161a16] px-4 text-sm font-semibold text-white";

function ActionIcon({ label }: { label: string }) {
  if (label === "Board") return <List className="h-4 w-4" aria-hidden />;
  if (label === "Score") return <Pencil className="h-4 w-4" aria-hidden />;
  if (label === "Watching" || label.startsWith("Watching")) return <Eye className="h-4 w-4" aria-hidden />;
  return null;
}

function ActionPill({ action }: { action: GameDayAction }) {
  if (action.tone === "watch") {
    return (
      <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#3dff8a] px-4 text-sm font-semibold text-zinc-950">
        <ActionIcon label={action.label} />
        {action.label}
      </span>
    );
  }
  if (action.tone === "account") {
    return (
      <span className={headerPillClass}>
        {action.label}
      </span>
    );
  }
  return (
    <Link href={action.href} className={headerPillClass}>
      <ActionIcon label={action.label} />
      {action.label}
    </Link>
  );
}

export function GameDayChrome({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<GameDayAction>(DEFAULT_ACTION);
  return (
    <GameDayActionContext.Provider value={setAction}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0f0c]">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 xl:px-6">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-1.5 font-display text-[1.65rem] leading-none tracking-tight text-white"
          >
            <BrandMark className="h-7 w-7 shrink-0" size={28} priority />
            <span className="truncate">
              LEAGUE<span className="text-[#3dff8a]">SPORTS</span>
            </span>
          </Link>
          {action.sports ? (
            <nav className="hidden items-center gap-4 xl:flex" aria-label="Sports">
              {SPORT_LINKS.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm font-semibold text-white">
                  {item.label}
                </Link>
              ))}
              <ActionPill action={action} />
            </nav>
          ) : null}
          <div className={action.sports ? "xl:hidden" : ""}>
            <ActionPill action={action} />
          </div>
        </div>
      </header>
      {children}
    </GameDayActionContext.Provider>
  );
}
