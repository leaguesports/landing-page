/**
 * Padel finished-match capture form model for /play?mode=padel&action=record.
 */

import {
  decideMatch,
  maxSets,
  type PadelFormat,
  type PadelSetScore,
} from "./padel-scoring.ts";

export const PADEL_CAPTURE_COPY = {
  title: "Record a match",
  lede: "Who played, and the sets.",
  back: "Back",
  teamA: "Team A",
  teamB: "Team B",
  playerPlaceholder: "Player name",
  formatLabel: "Best of",
  setsLabel: "Sets",
  addSet: "Add set",
  removeSet: "Remove set",
  submit: "Save match",
  saving: "Saving…",
  success: "Match saved",
  done: "Done",
} as const;

export type PadelCapturePlayer = { name: string };

export type PadelCaptureDraft = {
  format: PadelFormat;
  teamA: [PadelCapturePlayer, PadelCapturePlayer];
  teamB: [PadelCapturePlayer, PadelCapturePlayer];
  sets: PadelSetScore[];
};

export type PadelCaptureIssue =
  | { field: "players"; message: string }
  | { field: "sets"; message: string };

export function emptyPadelCaptureDraft(): PadelCaptureDraft {
  return {
    format: "best_of_3",
    teamA: [{ name: "" }, { name: "" }],
    teamB: [{ name: "" }, { name: "" }],
    sets: [
      { a: 0, b: 0 },
      { a: 0, b: 0 },
    ],
  };
}

function trimPlayers(side: readonly PadelCapturePlayer[]): { name: string }[] {
  return side
    .map((player) => ({ name: player.name.trim() }))
    .filter((player) => player.name.length > 0)
    .slice(0, 2);
}

export function validatePadelCaptureDraft(
  draft: PadelCaptureDraft,
): PadelCaptureIssue | null {
  const teamA = trimPlayers(draft.teamA);
  const teamB = trimPlayers(draft.teamB);
  if (teamA.length === 0 || teamB.length === 0) {
    return { field: "players", message: "Add at least one player on each team." };
  }
  for (const player of [...teamA, ...teamB]) {
    if (player.name.length > 40) {
      return { field: "players", message: "Keep player names under 40 characters." };
    }
  }
  const outcome = decideMatch(draft.format, draft.sets);
  if (!outcome) {
    return {
      field: "sets",
      message: "Enter a finished scoreline for this format.",
    };
  }
  return null;
}

export function padelCapturePayload(draft: PadelCaptureDraft): {
  config: { format: PadelFormat };
  event: {
    type: "match.recorded";
    data: {
      teams: { A: { name: string }[]; B: { name: string }[] };
      sets: PadelSetScore[];
    };
  };
} | null {
  if (validatePadelCaptureDraft(draft)) return null;
  return {
    config: { format: draft.format },
    event: {
      type: "match.recorded",
      data: {
        teams: {
          A: trimPlayers(draft.teamA),
          B: trimPlayers(draft.teamB),
        },
        sets: draft.sets.map((set) => ({ a: set.a, b: set.b })),
      },
    },
  };
}

export function canAddPadelSet(draft: PadelCaptureDraft): boolean {
  return draft.sets.length < maxSets(draft.format);
}

export function canRemovePadelSet(draft: PadelCaptureDraft): boolean {
  return draft.sets.length > 1;
}

export function padelCaptureHref(): string {
  return "/play?mode=padel&action=record";
}

export function padelHomeHref(): string {
  return "/play?mode=padel";
}

export function isPadelCaptureAction(value: string | null | undefined): boolean {
  return value?.trim().toLowerCase() === "record";
}
