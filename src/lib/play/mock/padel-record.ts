/**
 * Draft for the mock Record a match flow: format, teams, and an optional venue.
 * Scoring lives in padel-score.ts. Nothing here is fetched.
 */

import {
  PADEL_MOCK_PLAYERS,
  padelMockPlayer,
  padelMockVenue,
  type PadelMockPlayer,
} from "./padel-mock-data.ts";
import { emptyPadelSet, type PadelSet } from "./padel-score.ts";

export type PadelFormat = "singles" | "doubles";

export type PadelDraft = {
  format: PadelFormat;
  teamA: string[];
  teamB: string[];
  venueId: string | null;
  sets: PadelSet[];
};

export function slotCount(format: PadelFormat): number {
  return format === "singles" ? 1 : 2;
}

export function initialPadelDraft(): PadelDraft {
  return {
    format: "doubles",
    teamA: [],
    teamB: [],
    venueId: null,
    sets: [emptyPadelSet(), emptyPadelSet()],
  };
}

export function setDraftFormat(draft: PadelDraft, format: PadelFormat): PadelDraft {
  const slots = slotCount(format);
  return {
    ...draft,
    format,
    teamA: draft.teamA.slice(0, slots),
    teamB: draft.teamB.slice(0, slots),
  };
}

export function assignPlayer(draft: PadelDraft, playerId: string): PadelDraft {
  if (!padelMockPlayer(playerId)) return draft;
  if (draft.teamA.includes(playerId) || draft.teamB.includes(playerId)) return draft;
  const slots = slotCount(draft.format);
  if (draft.teamA.length < slots) return { ...draft, teamA: [...draft.teamA, playerId] };
  if (draft.teamB.length < slots) return { ...draft, teamB: [...draft.teamB, playerId] };
  return draft;
}

export function removePlayer(draft: PadelDraft, playerId: string): PadelDraft {
  return {
    ...draft,
    teamA: draft.teamA.filter((id) => id !== playerId),
    teamB: draft.teamB.filter((id) => id !== playerId),
  };
}

/** Picking the selected venue again clears it. Venue stays optional. */
export function setDraftVenue(draft: PadelDraft, venueId: string | null): PadelDraft {
  if (venueId === null) return { ...draft, venueId: null };
  if (!padelMockVenue(venueId)) return draft;
  return { ...draft, venueId: draft.venueId === venueId ? null : venueId };
}

export function teamsReady(draft: PadelDraft): boolean {
  const slots = slotCount(draft.format);
  if (draft.teamA.length !== slots || draft.teamB.length !== slots) return false;
  const ids = [...draft.teamA, ...draft.teamB];
  if (new Set(ids).size !== ids.length) return false;
  return ids.every((id) => padelMockPlayer(id) !== null);
}

export function availablePlayers(draft: PadelDraft): PadelMockPlayer[] {
  const taken = new Set([...draft.teamA, ...draft.teamB]);
  return PADEL_MOCK_PLAYERS.filter((player) => !taken.has(player.id)).map((player) => ({
    id: player.id,
    name: player.name,
  }));
}

export function playersFromIds(ids: readonly string[]): PadelMockPlayer[] | null {
  const players: PadelMockPlayer[] = [];
  for (const id of ids) {
    const player = padelMockPlayer(id);
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
