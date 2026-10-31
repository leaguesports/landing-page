/**
 * Draft for the mock Record a match flow: court slots, guests, and an optional venue.
 * Scoring lives in padel-score.ts. Nothing here is fetched.
 */

import {
  PADEL_MOCK_PLAYERS,
  PADEL_MOCK_VENUES,
  PADEL_MOCK_YOU_ID,
  padelMockPlayer,
  padelMockVenue,
  type PadelMockPlayer,
  type PadelMockVenue,
} from "./padel-mock-data.ts";
import { emptyPadelSet, type PadelSet } from "./padel-score.ts";

export type PadelFormat = "singles" | "doubles";

export type PadelSlotId = "A1" | "A2" | "B1" | "B2";

export type PadelGuest = { id: string; name: string };

export type PadelDraft = {
  format: PadelFormat;
  /** Index 0 is A1. Doubles also uses index 1 as A2. Empty slots are null. */
  teamA: (string | null)[];
  /** Index 0 is B1. Doubles also uses index 1 as B2. */
  teamB: (string | null)[];
  guests: PadelGuest[];
  venueId: string | null;
  sets: PadelSet[];
};

export function slotCount(format: PadelFormat): number {
  return format === "singles" ? 1 : 2;
}

export function courtSlots(format: PadelFormat): PadelSlotId[] {
  return format === "singles" ? ["A1", "B1"] : ["A1", "A2", "B1", "B2"];
}

export function slotsForSide(format: PadelFormat, side: "A" | "B"): PadelSlotId[] {
  if (format === "singles") return [side === "A" ? "A1" : "B1"];
  return side === "A" ? ["A1", "A2"] : ["B1", "B2"];
}

function slotIndex(slot: PadelSlotId): number {
  return slot === "A1" || slot === "B1" ? 0 : 1;
}

function sideOf(slot: PadelSlotId): "A" | "B" {
  return slot === "A1" || slot === "A2" ? "A" : "B";
}

export function readSlot(draft: PadelDraft, slot: PadelSlotId): string | null {
  const team = sideOf(slot) === "A" ? draft.teamA : draft.teamB;
  return team[slotIndex(slot)] ?? null;
}

export function slotOfPlayer(draft: PadelDraft, playerId: string): PadelSlotId | null {
  for (const slot of courtSlots(draft.format)) {
    if (readSlot(draft, slot) === playerId) return slot;
  }
  return null;
}

export function initialPadelDraft(): PadelDraft {
  return {
    format: "doubles",
    teamA: [PADEL_MOCK_YOU_ID, null],
    teamB: [null, null],
    guests: [],
    venueId: null,
    sets: [emptyPadelSet(), emptyPadelSet()],
  };
}

function activeTeams(draft: PadelDraft): { teamA: (string | null)[]; teamB: (string | null)[] } {
  const count = slotCount(draft.format);
  return {
    teamA: Array.from({ length: count }, (_, index) => draft.teamA[index] ?? null),
    teamB: Array.from({ length: count }, (_, index) => draft.teamB[index] ?? null),
  };
}

function readCopied(teamA: readonly (string | null)[], teamB: readonly (string | null)[], slot: PadelSlotId): string | null {
  const team = sideOf(slot) === "A" ? teamA : teamB;
  return team[slotIndex(slot)] ?? null;
}

function writeCopied(teamA: (string | null)[], teamB: (string | null)[], slot: PadelSlotId, value: string | null) {
  const team = sideOf(slot) === "A" ? teamA : teamB;
  team[slotIndex(slot)] = value;
}

function seatedIds(teamA: readonly (string | null)[], teamB: readonly (string | null)[]): Set<string> {
  return new Set([...teamA, ...teamB].filter((id): id is string => Boolean(id)));
}

function pruneGuests(
  guests: readonly PadelGuest[],
  teamA: readonly (string | null)[],
  teamB: readonly (string | null)[],
): PadelGuest[] {
  const seated = seatedIds(teamA, teamB);
  return guests.filter((guest) => seated.has(guest.id));
}

function commit(
  draft: PadelDraft,
  teamA: (string | null)[],
  teamB: (string | null)[],
): PadelDraft {
  return {
    ...draft,
    teamA,
    teamB,
    guests: pruneGuests(draft.guests, teamA, teamB),
  };
}

export function resolvePadelPlayer(draft: PadelDraft, id: string): PadelMockPlayer | null {
  const friend = padelMockPlayer(id);
  if (friend) return friend;
  const guest = draft.guests.find((item) => item.id === id);
  return guest ? { id: guest.id, name: guest.name } : null;
}

/** Singles keeps A1 and B1. Doubles adds empty A2 and B2. */
export function setDraftFormat(draft: PadelDraft, format: PadelFormat): PadelDraft {
  if (draft.format === format) return draft;
  const teamA = format === "singles" ? [draft.teamA[0] ?? null] : [draft.teamA[0] ?? null, null];
  const teamB = format === "singles" ? [draft.teamB[0] ?? null] : [draft.teamB[0] ?? null, null];
  return {
    ...draft,
    format,
    teamA,
    teamB,
    guests: pruneGuests(draft.guests, teamA, teamB),
  };
}

/**
 * Put playerId in this slot. A player already on the court swaps with whoever
 * is here (an empty slot swaps into a move).
 */
export function fillSlot(draft: PadelDraft, slot: PadelSlotId, playerId: string): PadelDraft {
  if (!courtSlots(draft.format).includes(slot)) return draft;
  if (!resolvePadelPlayer(draft, playerId)) return draft;
  const { teamA, teamB } = activeTeams(draft);
  if (readCopied(teamA, teamB, slot) === playerId) return draft;
  const other = courtSlots(draft.format).find(
    (id) => id !== slot && readCopied(teamA, teamB, id) === playerId,
  );
  if (other) writeCopied(teamA, teamB, other, readCopied(teamA, teamB, slot));
  writeCopied(teamA, teamB, slot, playerId);
  return commit(draft, teamA, teamB);
}

export function clearSlot(draft: PadelDraft, slot: PadelSlotId): PadelDraft {
  if (!courtSlots(draft.format).includes(slot)) return draft;
  if (!readSlot(draft, slot)) return draft;
  const { teamA, teamB } = activeTeams(draft);
  writeCopied(teamA, teamB, slot, null);
  return commit(draft, teamA, teamB);
}

function nextGuestId(draft: PadelDraft, name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "guest";
  const taken = new Set<string>([
    ...draft.guests.map((guest) => guest.id),
    ...draft.teamA.filter((id): id is string => Boolean(id)),
    ...draft.teamB.filter((id): id is string => Boolean(id)),
    ...PADEL_MOCK_PLAYERS.map((player) => player.id),
  ]);
  let id = `guest-${slug}`;
  let n = 2;
  while (taken.has(id)) {
    id = `guest-${slug}-${n}`;
    n += 1;
  }
  return id;
}

const UNNAMED_NAME = /^Player (\d+)$/;

/** You is player 1. Any seated "Player N" name holds that number too. */
export function nextUnnamedNumber(draft: PadelDraft): number {
  const used = new Set<number>([1]);
  for (const guest of draft.guests) {
    const match = UNNAMED_NAME.exec(guest.name);
    if (match) used.add(Number(match[1]));
  }
  let number = 2;
  while (used.has(number)) number += 1;
  return number;
}

function takenIds(draft: PadelDraft): Set<string> {
  return new Set<string>([
    ...draft.guests.map((guest) => guest.id),
    ...draft.teamA.filter((id): id is string => Boolean(id)),
    ...draft.teamB.filter((id): id is string => Boolean(id)),
    ...PADEL_MOCK_PLAYERS.map((player) => player.id),
  ]);
}

function nextUnnamedId(draft: PadelDraft, number: number): string {
  const taken = takenIds(draft);
  let id = `unnamed-${number}`;
  let extra = 2;
  while (taken.has(id)) {
    id = `unnamed-${number}-${extra}`;
    extra += 1;
  }
  return id;
}

/** Fills the slot with Player 2, Player 3, … using the lowest free number. */
export function addUnnamedToSlot(draft: PadelDraft, slot: PadelSlotId): PadelDraft {
  if (!courtSlots(draft.format).includes(slot)) return draft;
  const number = nextUnnamedNumber(draft);
  const guest = { id: nextUnnamedId(draft, number), name: `Player ${number}` };
  return fillSlot({ ...draft, guests: [...draft.guests, guest] }, slot, guest.id);
}

/** Unnamed players already on court, so a later pick can swap them. */
export function unnamedOnCourt(draft: PadelDraft, query = ""): PadelMockPlayer[] {
  const needle = query.trim().toLowerCase();
  return draft.guests
    .filter((guest) => guest.id.startsWith("unnamed-"))
    .filter((guest) => !needle || guest.name.toLowerCase().includes(needle))
    .map((guest) => ({ id: guest.id, name: guest.name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

/** Trimmed name becomes a new guest in that slot. Blank names do nothing. */
export function addGuestToSlot(draft: PadelDraft, slot: PadelSlotId, name: string): PadelDraft {
  if (!courtSlots(draft.format).includes(slot)) return draft;
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) return draft;
  const guest = { id: nextGuestId(draft, cleaned), name: cleaned };
  return fillSlot({ ...draft, guests: [...draft.guests, guest] }, slot, guest.id);
}

/** Sets the venue. Null clears it. The same id again stays put. */
export function setDraftVenue(draft: PadelDraft, venueId: string | null): PadelDraft {
  if (venueId === null) return draft.venueId === null ? draft : { ...draft, venueId: null };
  if (!padelMockVenue(venueId)) return draft;
  if (draft.venueId === venueId) return draft;
  return { ...draft, venueId };
}

/** Continue stays off until every slot on the court has a distinct player. */
export function teamsReady(draft: PadelDraft): boolean {
  const ids = courtSlots(draft.format).map((slot) => readSlot(draft, slot));
  if (ids.some((id) => !id)) return false;
  const filled = ids as string[];
  if (new Set(filled).size !== filled.length) return false;
  return filled.every((id) => resolvePadelPlayer(draft, id) !== null);
}

export function matchingPlayers(query: string): PadelMockPlayer[] {
  const needle = query.trim().toLowerCase();
  const players = PADEL_MOCK_PLAYERS.map((player) => ({ id: player.id, name: player.name }));
  if (!needle) return players;
  return players.filter((player) => player.name.toLowerCase().includes(needle));
}

export function matchingVenues(query: string): PadelMockVenue[] {
  const needle = query.trim().toLowerCase();
  const venues = PADEL_MOCK_VENUES.map((venue) => ({ id: venue.id, name: venue.name }));
  if (!needle) return venues;
  return venues.filter((venue) => venue.name.toLowerCase().includes(needle));
}

export function playersFromIds(draft: PadelDraft, ids: readonly (string | null)[]): PadelMockPlayer[] | null {
  const count = slotCount(draft.format);
  if (ids.length < count) return null;
  const players: PadelMockPlayer[] = [];
  for (let index = 0; index < count; index += 1) {
    const id = ids[index];
    if (!id) return null;
    const player = resolvePadelPlayer(draft, id);
    if (!player) return null;
    players.push(player);
  }
  return players;
}

export function formatPlayerList(players: readonly { name: string }[]): string {
  return players.map((player) => player.name).join(" & ");
}

export function shortPlayerList(players: readonly { name: string }[]): string {
  return players
    .map((player) => (player.name === "You" ? "You" : (player.name.split(/\s+/)[0] ?? player.name)))
    .join(" & ");
}
