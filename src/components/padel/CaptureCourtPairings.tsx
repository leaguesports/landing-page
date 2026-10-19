"use client";

import { ArrowLeftRight, Plus, UserPlus, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import type { SlotKey } from "@/components/padel/PlayerPairings";
import {
  CAPTURE_SLOT_KEYS,
  playerInitials,
  playerIsSelf,
  swapCaptureSlots,
} from "@/lib/padel/capture-court";
import {
  MODAL_FOCUSABLE_SELECTOR,
  wrapModalFocus,
} from "@/lib/golf/live-hole-ui";
import {
  loadRecentPlayers,
  makeGuestPlayer,
} from "@/lib/padel/recent-players";
import type { PadelPlayer } from "@/types/padel-match";

type CaptureCourtPairingsProps = {
  slots: Record<SlotKey, PadelPlayer | null>;
  onChange: (slots: Record<SlotKey, PadelPlayer | null>) => void;
  selfPlayer?: PadelPlayer | null;
};

const TEAMS: { team: "A" | "B"; keys: readonly SlotKey[] }[] = [
  { team: "A", keys: ["a1", "a2"] },
  { team: "B", keys: ["b1", "b2"] },
];

const SLOT_LABEL: Record<SlotKey, string> = {
  a1: "Team A, left",
  a2: "Team A, right",
  b1: "Team B, left",
  b2: "Team B, right",
};

const EMPTY_RECENT: PadelPlayer[] = [];
let recentSnapshot: PadelPlayer[] = EMPTY_RECENT;
let recentSnapshotKey = "";

function subscribeRecentPlayers(): () => void {
  return () => {};
}

function readRecentPlayers(): PadelPlayer[] {
  const players = loadRecentPlayers();
  const key = players.map((player) => `${player.id}:${player.displayName}`).join("|");
  if (key === recentSnapshotKey) return recentSnapshot;
  recentSnapshotKey = key;
  recentSnapshot = players;
  return recentSnapshot;
}

function useRecentPlayers(): PadelPlayer[] {
  return useSyncExternalStore(
    subscribeRecentPlayers,
    readRecentPlayers,
    () => EMPTY_RECENT,
  );
}

export function CaptureCourtPairings({
  slots,
  onChange,
  selfPlayer = null,
}: CaptureCourtPairingsProps) {
  const [pickerKey, setPickerKey] = useState<SlotKey | null>(null);
  const [switching, setSwitching] = useState(false);
  const [selectedKey, setSelectedKey] = useState<SlotKey | null>(null);
  const recent = useRecentPlayers();
  const slotSignature = CAPTURE_SLOT_KEYS.map((key) => slots[key]?.id ?? "").join(
    "|",
  );
  const [seenSignature, setSeenSignature] = useState(slotSignature);
  if (seenSignature !== slotSignature) {
    setSeenSignature(slotSignature);
    setSelectedKey(null);
  }

  useEffect(() => {
    if (!switching || pickerKey) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setSwitching(false);
      setSelectedKey(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [switching, pickerKey]);

  const closePicker = useCallback(() => {
    setPickerKey(null);
  }, []);

  function toggleSwitch() {
    setSwitching((on) => !on);
    setSelectedKey(null);
    setPickerKey(null);
  }

  function onSlotClick(key: SlotKey) {
    if (!switching) {
      setPickerKey(key);
      return;
    }
    if (!selectedKey) {
      if (!slots[key]) return;
      setSelectedKey(key);
      return;
    }
    if (selectedKey === key) {
      setSelectedKey(null);
      return;
    }
    onChange(swapCaptureSlots(slots, selectedKey, key));
    setSelectedKey(null);
  }

  const selectedName = selectedKey
    ? slots[selectedKey]?.displayName
    : null;

  return (
    <div className="space-y-3">
      <div
        className={[
          "overflow-hidden rounded-2xl border bg-[#141814]",
          switching ? "border-emerald-400/50" : "border-white/10",
        ].join(" ")}
      >
        <div className="relative bg-[#0c0f0c] px-4 py-5 sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-xl border border-emerald-400/25 sm:inset-4"
          />
          <div className="relative space-y-4">
            <CourtSide
              team="A"
              keys={TEAMS[0].keys}
              slots={slots}
              selfPlayer={selfPlayer}
              switching={switching}
              selectedKey={selectedKey}
              onSlotClick={onSlotClick}
            />
            <div className="flex items-center gap-3 px-2" aria-hidden>
              <div className="h-px flex-1 bg-emerald-200/70" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                Net
              </span>
              <div className="h-px flex-1 bg-emerald-200/70" />
            </div>
            <CourtSide
              team="B"
              keys={TEAMS[1].keys}
              slots={slots}
              selfPlayer={selfPlayer}
              switching={switching}
              selectedKey={selectedKey}
              onSlotClick={onSlotClick}
              labelBelow
            />
          </div>
        </div>
        <div className="space-y-2 border-t border-white/8 bg-[#141814] p-3">
          <button
            type="button"
            aria-pressed={switching}
            onClick={toggleSwitch}
            className={[
              "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium transition-colors",
              switching
                ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                : "border-white/12 bg-[#0c0f0c] text-white hover:border-emerald-400/40",
            ].join(" ")}
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden />
            {switching ? "Done switching" : "Switch positions"}
          </button>
          {switching ? (
            <p className="text-center text-xs text-zinc-400">
              {selectedName
                ? `Tap the slot ${selectedName} should switch with.`
                : "Tap a player, then tap the slot they should take."}
            </p>
          ) : (
            <p className="text-center text-xs text-zinc-500">
              Tap a slot to choose who plays there.
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {switching
              ? selectedName
                ? `${selectedName} selected. Tap another slot to switch.`
                : "Switch positions. Tap a filled slot, then another slot."
              : ""}
          </p>
        </div>
      </div>

      {pickerKey ? (
        <PlayerPickerSheet
          key={pickerKey}
          slotKey={pickerKey}
          slots={slots}
          selfPlayer={selfPlayer}
          recent={recent}
          onAssign={(player) => {
            onChange({ ...slots, [pickerKey]: player });
            setPickerKey(null);
          }}
          onClear={() => {
            onChange({ ...slots, [pickerKey]: null });
          }}
          onClose={closePicker}
        />
      ) : null}
    </div>
  );
}

function CourtSide({
  team,
  keys,
  slots,
  selfPlayer,
  switching,
  selectedKey,
  onSlotClick,
  labelBelow = false,
}: {
  team: "A" | "B";
  keys: readonly SlotKey[];
  slots: Record<SlotKey, PadelPlayer | null>;
  selfPlayer: PadelPlayer | null;
  switching: boolean;
  selectedKey: SlotKey | null;
  onSlotClick: (key: SlotKey) => void;
  labelBelow?: boolean;
}) {
  const label = (
    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
      Team {team}
    </p>
  );
  return (
    <div className="space-y-3">
      {labelBelow ? null : label}
      <div className="grid grid-cols-2 gap-3">
        {keys.map((key) => (
          <CourtSlot
            key={key}
            slotKey={key}
            player={slots[key]}
            selfPlayer={selfPlayer}
            switching={switching}
            selected={selectedKey === key}
            onClick={() => onSlotClick(key)}
          />
        ))}
      </div>
      {labelBelow ? label : null}
    </div>
  );
}

function CourtSlot({
  slotKey,
  player,
  selfPlayer,
  switching,
  selected,
  onClick,
}: {
  slotKey: SlotKey;
  player: PadelPlayer | null;
  selfPlayer: PadelPlayer | null;
  switching: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const mine = playerIsSelf(player, selfPlayer);
  const label = SLOT_LABEL[slotKey];
  const ariaLabel = player
    ? switching
      ? selected
        ? `${label}, ${player.displayName}, selected. Tap again to cancel.`
        : `${label}, ${player.displayName}. Select to switch positions.`
      : `${label}, ${player.displayName}. Change player.`
    : switching
      ? `${label}, empty.`
      : `${label}, empty. Add player.`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={switching ? selected : undefined}
      aria-label={ariaLabel}
      className={[
        "flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
        selected
          ? "bg-emerald-400/15 ring-2 ring-emerald-400"
          : "hover:bg-white/5",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-16 w-16 items-center justify-center rounded-full text-sm font-semibold",
          player
            ? "border border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
            : "border border-dashed border-white/30 bg-[#141814] text-zinc-400",
        ].join(" ")}
        aria-hidden
      >
        {player ? playerInitials(player.displayName) : <Plus className="h-5 w-5" />}
      </span>
      <span className="max-w-full min-w-0">
        <span
          className={[
            "block truncate text-sm font-medium",
            player ? "text-white" : "text-zinc-500",
          ].join(" ")}
        >
          {player?.displayName ?? "Add"}
        </span>
        {mine ? (
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            You
          </span>
        ) : null}
      </span>
    </button>
  );
}

function PlayerPickerSheet({
  slotKey,
  slots,
  selfPlayer,
  recent,
  onAssign,
  onClear,
  onClose,
}: {
  slotKey: SlotKey;
  slots: Record<SlotKey, PadelPlayer | null>;
  selfPlayer: PadelPlayer | null;
  recent: PadelPlayer[];
  onAssign: (player: PadelPlayer) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const guestFieldId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [guestName, setGuestName] = useState("");
  const current = slots[slotKey];
  const selfSeated = useMemo(
    () =>
      (Object.values(slots) as (PadelPlayer | null)[]).some((player) =>
        playerIsSelf(player, selfPlayer),
      ),
    [slots, selfPlayer],
  );
  const takenIds = useMemo(() => {
    const ids = new Set<string>();
    for (const player of Object.values(slots)) {
      if (player) ids.add(player.id);
    }
    return ids;
  }, [slots]);
  const recentChoices = recent.filter(
    (player) => !takenIds.has(player.id) && !playerIsSelf(player, selfPlayer),
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = [
        ...root.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR),
      ].filter((node) => !node.hasAttribute("disabled"));
      const wrapTo = wrapModalFocus(
        focusable,
        document.activeElement,
        event.shiftKey,
      );
      if (!wrapTo) return;
      event.preventDefault();
      wrapTo.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  function addGuest() {
    const name = guestName.trim();
    if (!name) return;
    onAssign(makeGuestPlayer(name));
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative flex max-h-[min(36rem,85dvh)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#141814] shadow-[0_18px_40px_rgba(0,0,0,0.45)] outline-none sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              Choose player
            </h2>
            <p id={descriptionId} className="mt-0.5 text-sm text-zinc-500">
              {SLOT_LABEL[slotKey]}
              {current ? ` · ${current.displayName}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {selfPlayer && !selfSeated ? (
            <button
              type="button"
              onClick={() => onAssign(selfPlayer)}
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-emerald-400/15 px-3 py-2.5 text-left text-sm font-medium text-emerald-200 hover:bg-emerald-400/20"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-xs font-semibold"
                aria-hidden
              >
                {playerInitials(selfPlayer.displayName)}
              </span>
              You — {selfPlayer.displayName}
            </button>
          ) : null}

          {recentChoices.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Recent
              </p>
              <ul className="space-y-1">
                {recentChoices.map((player) => (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => onAssign(player)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/8"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-[11px] font-semibold text-zinc-200"
                        aria-hidden
                      >
                        {playerInitials(player.displayName)}
                      </span>
                      {player.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <label
              htmlFor={guestFieldId}
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Add guest
            </label>
            <div className="flex gap-2">
              <input
                id={guestFieldId}
                type="text"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addGuest();
                  }
                }}
                placeholder="Guest name"
                className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400/40"
              />
              <button
                type="button"
                onClick={addGuest}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-white px-3 text-sm font-semibold text-zinc-950"
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Add
              </button>
            </div>
          </div>
        </div>

        {current ? (
          <div className="border-t border-white/8 px-4 py-3">
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-zinc-400 hover:text-white"
            >
              Clear slot
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
