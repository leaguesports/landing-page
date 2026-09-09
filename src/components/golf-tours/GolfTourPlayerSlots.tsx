"use client";

import type { Friend } from "@/lib/friends/friends";

export type GolfTourSlotDraft = {
  displayName: string;
  userId: string | null;
};

export const EMPTY_GOLF_TOUR_SLOTS: GolfTourSlotDraft[] = [
  { displayName: "", userId: null },
  { displayName: "", userId: null },
  { displayName: "", userId: null },
  { displayName: "", userId: null },
];

export function emptyGolfTourSlots(seed?: {
  displayName?: string | null;
  userId?: string | null;
}): GolfTourSlotDraft[] {
  const next = EMPTY_GOLF_TOUR_SLOTS.map((slot) => ({ ...slot }));
  const displayName = seed?.displayName?.trim() ?? "";
  if (displayName) {
    next[0] = {
      displayName,
      userId: seed?.userId?.trim() || null,
    };
  }
  return next;
}

export function golfTourFieldClass(): string {
  return "box-border min-h-11 w-full min-w-0 max-w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none [color-scheme:dark] focus:border-emerald-400/40";
}

export function golfTourPrimaryButtonClass(extra = ""): string {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function golfTourOutlineButtonClass(extra = ""): string {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-200 hover:border-white/20 disabled:opacity-50",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function GolfTourPlayerSlots({
  slots,
  friends,
  onChange,
  disabled,
}: {
  slots: GolfTourSlotDraft[];
  friends: Friend[];
  onChange: (slots: GolfTourSlotDraft[]) => void;
  disabled?: boolean;
}) {
  function setSlot(index: number, patch: Partial<GolfTourSlotDraft>) {
    onChange(
      slots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  }

  function fillFromFriend(friend: Friend) {
    const taken = new Set(
      slots.map((slot) => slot.userId).filter((id): id is string => Boolean(id)),
    );
    if (taken.has(friend.id)) return;
    const emptyIndex = slots.findIndex((slot) => !slot.displayName.trim());
    if (emptyIndex < 0) return;
    setSlot(emptyIndex, {
      displayName: friend.displayName,
      userId: friend.id,
    });
  }

  return (
    <div className="space-y-2">
      {friends.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {friends.slice(0, 8).map((friend) => (
            <button
              key={friend.id}
              type="button"
              disabled={disabled}
              onClick={() => fillFromFriend(friend)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-white/20 disabled:opacity-50"
            >
              {friend.displayName}
            </button>
          ))}
        </div>
      ) : null}
      {slots.map((slot, index) => (
        <label key={index} className="block">
          <span className="mb-1 block text-xs text-zinc-500">
            Player {index + 1}
            {index === 0 ? " (required)" : " (optional)"}
          </span>
          <input
            type="text"
            value={slot.displayName}
            disabled={disabled}
            placeholder={index === 0 ? "Name to start this fourball" : "Guest or friend"}
            onChange={(event) =>
              setSlot(index, {
                displayName: event.target.value,
                userId: null,
              })
            }
            className={golfTourFieldClass()}
          />
        </label>
      ))}
    </div>
  );
}
