import type { PadelPlayer } from "../../types/padel-match.ts";
import type { QuickStartSlotKey } from "./quick-start-defaults.ts";

export type CaptureSlotKey = QuickStartSlotKey;

export const CAPTURE_SLOT_KEYS: readonly CaptureSlotKey[] = [
  "a1",
  "a2",
  "b1",
  "b2",
];

/** Swap any two court slots, including across teams and with an empty slot. */
export function swapCaptureSlots(
  slots: Record<CaptureSlotKey, PadelPlayer | null>,
  from: CaptureSlotKey,
  to: CaptureSlotKey,
): Record<CaptureSlotKey, PadelPlayer | null> {
  if (from === to) return slots;
  return {
    ...slots,
    [from]: slots[to],
    [to]: slots[from],
  };
}

export function playerIsSelf(
  player: PadelPlayer | null | undefined,
  selfPlayer: PadelPlayer | null | undefined,
): boolean {
  if (!player || !selfPlayer) return false;
  if (player.id === selfPlayer.id) return true;
  return (
    player.userId != null &&
    selfPlayer.userId != null &&
    player.userId === selfPlayer.userId
  );
}

/** Signed-out capture has no self to seat. Signed-in self must occupy a slot. */
export function selfIsSeated(
  slots: Record<CaptureSlotKey, PadelPlayer | null>,
  selfPlayer: PadelPlayer | null | undefined,
): boolean {
  if (!selfPlayer) return true;
  return CAPTURE_SLOT_KEYS.some((key) => playerIsSelf(slots[key], selfPlayer));
}

/**
 * Save stays disabled until every slot is filled and, when someone is signed
 * in, that person is one of the four named players.
 */
export function capturePairingsReady(
  slots: Record<CaptureSlotKey, PadelPlayer | null>,
  selfPlayer: PadelPlayer | null | undefined,
): boolean {
  const filled = CAPTURE_SLOT_KEYS.every((key) => slots[key] != null);
  return filled && selfIsSeated(slots, selfPlayer);
}

/** Two-letter mark for a court avatar. Strips a trailing "(Guest)". */
export function playerInitials(displayName: string): string {
  const cleaned = displayName.replace(/\s*\(guest\)\s*$/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}
