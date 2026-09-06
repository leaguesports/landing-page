"use client";

import { FixtureLiveBoardView } from "@/components/events/FixtureLiveBoard";
import type { FixtureLiveBoard } from "@/types/fixture-feed";
import Link from "next/link";

/** Compact live chip for list / featured surfaces — opens the fixture feed. */
export function FixtureLiveChip({
  href,
  board,
}: {
  href: string;
  board: FixtureLiveBoard | null;
}) {
  if (!board || board.status === "scheduled") return null;

  return (
    <Link
      href={`${href}#live-feed`}
      className="group mt-3 block rounded-2xl border border-emerald-400/20 bg-emerald-950/20 px-3 py-2.5 transition-colors hover:border-emerald-400/40 hover:bg-emerald-950/35"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Open live feed
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500 transition-colors group-hover:text-zinc-300">
          Updates →
        </span>
      </div>
      <FixtureLiveBoardView board={board} compact />
    </Link>
  );
}
