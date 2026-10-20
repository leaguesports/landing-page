/**
 * MOCK
 * Fake friends and venues for the padel "Record a match" demo.
 * Not real people, clubs, or API data. Nothing in this module is fetched.
 * The flow reads only this list, plus matches the browser keeps in localStorage.
 */

export const PADEL_MOCK_YOU_ID = "you";

export const PADEL_MOCK_PLAYERS = [
  { id: "you", name: "You" },
  { id: "alex-nkosi", name: "Alex Nkosi" },
  { id: "sam-pillay", name: "Sam Pillay" },
  { id: "riley-botha", name: "Riley Botha" },
  { id: "jordan-naidoo", name: "Jordan Naidoo" },
  { id: "casey-mokoena", name: "Casey Mokoena" },
] as const;

export type PadelMockPlayer = { id: string; name: string };

export const PADEL_MOCK_VENUES = [
  { id: "harbour-padel", name: "Harbour Padel" },
  { id: "north-courts", name: "North Courts" },
  { id: "kloof-club", name: "Kloof Club" },
] as const;

export type PadelMockVenue = { id: string; name: string };

export function padelMockPlayer(id: string): PadelMockPlayer | null {
  const player = PADEL_MOCK_PLAYERS.find((item) => item.id === id);
  return player ? { id: player.id, name: player.name } : null;
}

export function padelMockVenue(id: string): PadelMockVenue | null {
  const venue = PADEL_MOCK_VENUES.find((item) => item.id === id);
  return venue ? { id: venue.id, name: venue.name } : null;
}
