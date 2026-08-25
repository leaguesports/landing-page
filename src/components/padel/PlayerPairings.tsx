"use client";

import { UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  loadRecentPlayers,
  makeGuestPlayer,
} from "@/lib/padel/recent-players";
import type { PadelPlayer } from "@/types/padel-match";

export type SlotKey = "a1" | "a2" | "b1" | "b2";

type PlayerPairingsProps = {
  slots: Record<SlotKey, PadelPlayer | null>;
  onChange: (slots: Record<SlotKey, PadelPlayer | null>) => void;
  selfPlayer?: PadelPlayer | null;
};

const SLOT_META: { key: SlotKey; team: "A" | "B"; label: string }[] = [
  { key: "a1", team: "A", label: "Player 1" },
  { key: "a2", team: "A", label: "Player 2" },
  { key: "b1", team: "B", label: "Player 3" },
  { key: "b2", team: "B", label: "Player 4" },
];

export function PlayerPairings({
  slots,
  onChange,
  selfPlayer,
}: PlayerPairingsProps) {
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [guestName, setGuestName] = useState("");
  const recent = useMemo(() => loadRecentPlayers(), []);

  const takenIds = useMemo(
    () =>
      new Set(
        Object.values(slots)
          .filter(Boolean)
          .map((p) => p!.id),
      ),
    [slots],
  );

  function assign(slot: SlotKey, player: PadelPlayer) {
    onChange({ ...slots, [slot]: player });
    setActiveSlot(null);
    setGuestName("");
  }

  function clear(slot: SlotKey) {
    onChange({ ...slots, [slot]: null });
  }

  function addGuest(slot: SlotKey) {
    const name = guestName.trim();
    if (!name) return;
    assign(slot, makeGuestPlayer(name));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["A", "B"] as const).map((team) => (
          <div
            key={team}
            className="rounded-3xl border border-white/8 bg-[#141814] p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Team {team}
            </p>
            <div className="space-y-2">
              {SLOT_META.filter((s) => s.team === team).map((meta) => {
                const player = slots[meta.key];
                const isActive = activeSlot === meta.key;
                return (
                  <div key={meta.key}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlot(isActive ? null : meta.key)
                      }
                      className={[
                        "flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-left transition-colors",
                        isActive
                          ? "border-emerald-400/50 bg-emerald-400/10"
                          : "border-white/8 bg-white/3 hover:border-white/16",
                      ].join(" ")}
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] uppercase tracking-wider text-zinc-500">
                          {meta.label}
                        </span>
                        <span className="block truncate text-sm font-medium text-white">
                          {player?.displayName ?? "Tap to pick"}
                        </span>
                      </span>
                      {player ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            clear(meta.key);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              clear(meta.key);
                            }
                          }}
                          className="shrink-0 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
                        >
                          Clear
                        </span>
                      ) : (
                        <Users
                          className="h-4 w-4 shrink-0 text-zinc-500"
                          aria-hidden
                        />
                      )}
                    </button>

                    {isActive ? (
                      <div className="mt-2 space-y-2 rounded-2xl border border-white/8 bg-[#0c0f0c] p-3">
                        {selfPlayer && !takenIds.has(selfPlayer.id) ? (
                          <button
                            type="button"
                            onClick={() => assign(meta.key, selfPlayer)}
                            className="flex w-full items-center gap-2 rounded-xl bg-emerald-400/15 px-3 py-2.5 text-sm font-medium text-emerald-300"
                          >
                            You — {selfPlayer.displayName}
                          </button>
                        ) : null}

                        {recent.filter((p) => !takenIds.has(p.id)).length >
                        0 ? (
                          <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                              Recent
                            </p>
                            <ul className="space-y-1">
                              {recent
                                .filter((p) => !takenIds.has(p.id))
                                .slice(0, 6)
                                .map((p) => (
                                  <li key={p.id}>
                                    <button
                                      type="button"
                                      onClick={() => assign(meta.key, p)}
                                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/8"
                                    >
                                      {p.displayName}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ) : null}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addGuest(meta.key);
                              }
                            }}
                            placeholder="Guest name"
                            className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400/40"
                          />
                          <button
                            type="button"
                            onClick={() => addGuest(meta.key)}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-zinc-950"
                          >
                            <UserPlus className="h-4 w-4" aria-hidden />
                            Add
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function swapTeamSlots(
  slots: Record<SlotKey, PadelPlayer | null>,
): Record<SlotKey, PadelPlayer | null> {
  return {
    a1: slots.b1,
    a2: slots.b2,
    b1: slots.a1,
    b2: slots.a2,
  };
}
