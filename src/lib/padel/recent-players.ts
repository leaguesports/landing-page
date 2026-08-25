import type { PadelPlayer } from "@/types/padel-match";

const RECENT_KEY = "padel-recent-players";
const MAX_RECENT = 12;

export function loadRecentPlayers(): PadelPlayer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PadelPlayer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberPlayers(players: PadelPlayer[]): void {
  if (typeof window === "undefined") return;
  const existing = loadRecentPlayers();
  const byKey = new Map<string, PadelPlayer>();

  for (const p of [...players, ...existing]) {
    const key = (p.userId ?? p.displayName).toLowerCase();
    if (!byKey.has(key)) byKey.set(key, p);
  }

  const next = Array.from(byKey.values()).slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function makeGuestPlayer(name: string): PadelPlayer {
  const trimmed = name.trim() || "Guest";
  const displayName = /\(guest\)$/i.test(trimmed)
    ? trimmed
    : `${trimmed} (Guest)`;
  return {
    id: `guest_${crypto.randomUUID().slice(0, 8)}`,
    displayName,
    isGuest: true,
    userId: null,
  };
}

export function makeUserPlayer(opts: {
  id: string;
  displayName: string;
  userId?: string;
}): PadelPlayer {
  return {
    id: opts.id,
    displayName: opts.displayName,
    isGuest: false,
    userId: opts.userId ?? opts.id,
  };
}
