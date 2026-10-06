"use client";

import {
  Award,
  CalendarCheck,
  CircleHelp,
  History,
  Info,
  MapPin,
  Medal,
  Trophy,
  Tv,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SECTION_ICONS: Record<string, LucideIcon> = {
  fixtures: Tv,
  play: Trophy,
  book: CalendarCheck,
  about: Info,
  sports: Medal,
  questions: CircleHelp,
  "match-history": History,
  "friends-played": Users,
  leaderboards: Award,
  nearby: MapPin,
};

/** Site header (4rem) plus this bar, with a little air under the tabs. */
const SCROLL_OFFSET = 132;

function SectionIcon({ id }: { id: string }) {
  const Icon = SECTION_ICONS[id];
  if (!Icon) return null;
  return <Icon className="h-4 w-4 shrink-0" aria-hidden />;
}

export function VenueSectionNav({
  tabs,
}: {
  tabs: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);
  const lockRef = useRef<string | null>(null);
  const signature = tabs.map((tab) => tab.id).join("|");

  useEffect(() => {
    const ids = signature.split("|").filter(Boolean);
    let frame = 0;

    const currentId = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) return ids[ids.length - 1] ?? "";
      let current = ids[0] ?? "";
      for (const id of ids) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= SCROLL_OFFSET + 8) current = id;
      }
      return current;
    };

    const update = () => {
      if (lockRef.current) {
        const node = document.getElementById(lockRef.current);
        const settled =
          !node || Math.abs(node.getBoundingClientRect().top - SCROLL_OFFSET) < 12;
        if (!settled) return;
        lockRef.current = null;
      }
      const next = currentId();
      if (next) setActive(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [signature]);

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    current?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [active]);

  if (tabs.length === 0) return null;

  function select(id: string) {
    const node = document.getElementById(id);
    if (!node) return;
    lockRef.current = id;
    setActive(id);
    const top = window.scrollY + node.getBoundingClientRect().top - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    window.setTimeout(() => {
      if (lockRef.current === id) lockRef.current = null;
    }, 900);
  }

  return (
    <nav
      aria-label="Venue sections"
      className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur"
    >
      <ul
        ref={listRef}
        className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8"
      >
        {tabs.map((tab) => {
          const current = tab.id === active;
          return (
            <li key={tab.id} className="shrink-0">
              <a
                href={`#${tab.id}`}
                aria-current={current ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  select(tab.id);
                }}
                className={`inline-flex min-h-12 items-center gap-2 border-b-2 px-4 text-sm font-medium whitespace-nowrap ${
                  current
                    ? "border-zinc-950 text-zinc-950"
                    : "border-transparent text-zinc-500 hover:text-zinc-950"
                }`}
              >
                <SectionIcon id={tab.id} />
                {tab.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
