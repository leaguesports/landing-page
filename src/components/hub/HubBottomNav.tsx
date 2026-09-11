"use client";

import {
  HUB_TABS,
  hubTabHref,
  type HubTabId,
} from "@/lib/sports/hub-ia";
import { Home, Trophy, User, Users } from "lucide-react";
import Link from "next/link";

function HubTabIcon({ id }: { id: HubTabId }) {
  if (id === "home") return <Home className="h-5 w-5" aria-hidden />;
  if (id === "play") return <Trophy className="h-5 w-5" aria-hidden />;
  if (id === "people") return <Users className="h-5 w-5" aria-hidden />;
  return <User className="h-5 w-5" aria-hidden />;
}

type HubBottomNavProps = {
  active: HubTabId;
  friendRequestCount?: number;
  /** In-hub tabs (Home / People / You) stay as buttons when provided. */
  onSelectTab?: (id: HubTabId) => void;
};

export function HubBottomNav({
  active,
  friendRequestCount = 0,
  onSelectTab,
}: HubBottomNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#0c0f0c]/95 backdrop-blur-xl">
      <nav
        aria-label="Hub"
        className="mx-auto grid max-w-none grid-cols-4 pb-[max(0.4rem,env(safe-area-inset-bottom))] lg:max-w-xl"
      >
        {HUB_TABS.map((item) => {
          const selected = active === item.id;
          const badge =
            item.id === "people" && friendRequestCount > 0
              ? friendRequestCount
              : null;
          const href = hubTabHref(item.id);
          const className = [
            "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
            selected ? "text-emerald-200" : "text-zinc-500 hover:text-white",
          ].join(" ");
          const body = (
            <>
              <HubTabIcon id={item.id} />
              {item.label}
              {badge ? (
                <span className="absolute top-1.5 right-[calc(50%-1.15rem)] inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-zinc-950 tabular-nums">
                  {badge}
                </span>
              ) : null}
            </>
          );

          if (item.id === "play" || !onSelectTab) {
            return (
              <Link
                key={item.id}
                href={href}
                aria-current={selected ? "page" : undefined}
                className={className}
              >
                {body}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`hub-panel-${item.id}`}
              id={`hub-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={className}
            >
              {body}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
