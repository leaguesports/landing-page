"use client";

import { useCallback, useState } from "react";
import { lockPadelMatch } from "@/lib/match-api";
import { toLockMatchBody } from "@/lib/padel/api-match";
import { applyLockedPadelResult } from "@/lib/padel/apply-locked-result";
import type { MatchChannelEventType, PadelMatch } from "@/types/padel-match";

export type LockPadelPublish = (
  eventType: MatchChannelEventType,
  payload: { state: PadelMatch },
) => Promise<void> | void;

export function useLockPadelMatch(
  match: PadelMatch,
  publish: LockPadelPublish,
) {
  const [locking, setLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  const canLock = Boolean(toLockMatchBody(match)) && !match.lockedAt;

  const lockMatch = useCallback(async (): Promise<PadelMatch> => {
    if (match.lockedAt) return match;
    const body = toLockMatchBody(match);
    if (!body) return match;

    setLocking(true);
    setLockError(null);
    try {
      const lockedMatch = await lockPadelMatch(match.id, body, match.venue);
      const next = applyLockedPadelResult(match, lockedMatch);
      await publish("STATE_SYNC", { state: next });
      return next;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not end the match.";
      setLockError(message);
      return match;
    } finally {
      setLocking(false);
    }
  }, [match, publish]);

  return { lockMatch, locking, lockError, canLock };
}
