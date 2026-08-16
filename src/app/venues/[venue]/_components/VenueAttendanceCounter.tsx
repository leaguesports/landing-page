"use client";

import { useEffect, useState } from "react";

function weekendKey(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);
  return monday.toISOString().slice(0, 10);
}

function storageKey(venueSlug: string) {
  return `ls-venue-going:${venueSlug}:${weekendKey()}`;
}

type StoredAttendance = {
  count: number;
  going: boolean;
};

const DEFAULT_BASE = 11;

export function VenueAttendanceCounter({
  venueSlug,
  initialCount = DEFAULT_BASE,
}: {
  venueSlug: string;
  initialCount?: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [going, setGoing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(venueSlug));
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAttendance;
        if (typeof parsed.count === "number") setCount(parsed.count);
        if (typeof parsed.going === "boolean") setGoing(parsed.going);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, [venueSlug]);

  function persist(next: StoredAttendance) {
    try {
      window.localStorage.setItem(storageKey(venueSlug), JSON.stringify(next));
    } catch {
      // private mode / quota — still update UI
    }
  }

  function toggleGoing() {
    const nextGoing = !going;
    const nextCount = Math.max(0, count + (nextGoing ? 1 : -1));
    setGoing(nextGoing);
    setCount(nextCount);
    persist({ count: nextCount, going: nextGoing });
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
        Who&apos;s going
      </p>
      <p className="mb-4 text-sm text-zinc-400" aria-live="polite">
        {hydrated
          ? `${count} LeagueSports fans going this weekend`
          : `${initialCount} LeagueSports fans going this weekend`}
      </p>
      <button
        type="button"
        onClick={toggleGoing}
        aria-pressed={going}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors sm:w-auto ${
          going
            ? "bg-[var(--color-brand)] text-zinc-950"
            : "border border-white/12 bg-white/5 text-white hover:bg-white hover:text-zinc-950"
        }`}
      >
        🍺 I&apos;m Watching / Playing Here This Weekend
      </button>
    </div>
  );
}
