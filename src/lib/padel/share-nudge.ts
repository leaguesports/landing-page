/** sessionStorage key so the live-match WhatsApp nudge is not re-shown every point. */
const SHARE_NUDGE_DISMISS_PREFIX = "ls_padel_share_nudge_dismissed:";

export function padelShareNudgeDismissKey(matchId: string): string {
  return `${SHARE_NUDGE_DISMISS_PREFIX}${matchId}`;
}

function resolveStorage(storage?: Storage | null): Storage | null {
  if (storage !== undefined) return storage;
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

/** True when the host already dismissed the share nudge for this match. */
export function isPadelShareNudgeDismissed(
  matchId: string,
  storage?: Storage | null,
): boolean {
  const store = resolveStorage(storage);
  if (!store || !matchId) return false;
  try {
    return store.getItem(padelShareNudgeDismissKey(matchId)) === "1";
  } catch {
    return false;
  }
}

/** Persist dismiss for this matchId for the rest of the browser session. */
export function dismissPadelShareNudge(
  matchId: string,
  storage?: Storage | null,
): void {
  const store = resolveStorage(storage);
  if (!store || !matchId) return;
  try {
    store.setItem(padelShareNudgeDismissKey(matchId), "1");
  } catch {
    // ignore quota / private-mode failures
  }
}
