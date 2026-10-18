"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameDayCard, QueuedHolePut } from "@/types/golf-game-day";
import {
  confirmCard,
  fetchCard,
  GameDayApiError,
  putHole,
} from "@/lib/golf-game-day/api";
import { gameDayBoardPath, gameDayCardPath, gameDayReviewPath, presentGameDay } from "@/lib/golf-game-day/paths";
import {
  enqueueHolePut,
  flushHoleQueue,
  writeCardQueue,
} from "@/lib/golf-game-day/queue";
import {
  finishedRound,
  formatHandicap,
  formatToPar,
  grossForSlot,
  holeSyncState,
  holesStillOpen,
  initialHoleStrokes,
  mergeCard,
  overallSyncLabel,
  scoreRelation,
  shotChipLabel,
  stepStroke,
  strokeDotsForPlayer,
} from "@/lib/golf-game-day/scoring-ui";
import {
  cacheCard,
  localStorageStore,
  readCachedCard,
  readDevice,
  readHoleQueue,
} from "@/lib/golf-game-day/storage";
import { CardReview } from "./CardReview";
import { ScoreEntry } from "./ScoreEntry";
import { GameDayColumn } from "./ui";

type CardClientProps = {
  gameDayId: string;
  cardId: string;
  mode: "score" | "review";
};

export function CardClient({ gameDayId, cardId, mode }: CardClientProps) {
  const router = useRouter();
  const store = useMemo(() => localStorageStore(), []);
  const [card, setCard] = useState<GameDayCard | null>(null);
  const [queue, setQueue] = useState<QueuedHolePut[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Record<string, number>>>({});
  const [holeNumber, setHoleNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [ready, setReady] = useState(false);
  const queueRef = useRef<QueuedHolePut[]>([]);
  const flushing = useRef(false);
  const timer = useRef<number | null>(null);

  const remember = useCallback(
    (next: QueuedHolePut[]) => {
      queueRef.current = next;
      writeCardQueue(store, cardId, next);
      setQueue(next);
    },
    [cardId, store],
  );

  const flush = useCallback(async () => {
    const session = readDevice(store, gameDayId);
    if (!session?.deviceToken) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      remember(queueRef.current.map((item) => ({ ...item, state: "offline" as const })));
      return;
    }
    if (flushing.current) return;
    flushing.current = true;
    try {
      const pending = queueRef.current;
      const flushed = await flushHoleQueue(pending, async (item) => {
        const latest = queueRef.current.find(
          (row) => row.cardId === item.cardId && row.holeNumber === item.holeNumber,
        );
        if (!latest || latest.clientTimestamp !== item.clientTimestamp) {
          return { ok: true, reason: "replay" };
        }
        try {
          const response = await putHole(
            gameDayId,
            cardId,
            latest.holeNumber,
            session.deviceToken,
            { clientTimestamp: latest.clientTimestamp, strokes: latest.strokes },
          );
          const merged = mergeCard(response.card, session.playerId);
          setCard(merged);
          cacheCard(store, merged);
          if (response.reason === "stale") {
            setDrafts((current) => {
              const copy = { ...current };
              delete copy[latest.holeNumber];
              return copy;
            });
          }
          return { ok: true, reason: response.reason };
        } catch (cause) {
          if (cause instanceof GameDayApiError && (cause.status === 401 || cause.status === 403)) {
            setError(cause.message);
            return { ok: false, kind: "auth", message: cause.message };
          }
          if (cause instanceof GameDayApiError && cause.status > 0 && cause.status !== 429) {
            setError(cause.message);
            return { ok: false, kind: "rejected", message: cause.message };
          }
          return { ok: false, kind: "network" };
        }
      });
      const during = queueRef.current.filter(
        (item) =>
          !pending.some(
            (row) =>
              row.holeNumber === item.holeNumber && row.clientTimestamp === item.clientTimestamp,
          ),
      );
      let merged = flushed;
      for (const item of during) merged = enqueueHolePut(merged, item);
      remember(merged);
    } finally {
      flushing.current = false;
    }
  }, [cardId, gameDayId, remember, store]);

  useEffect(() => {
    const cached = readCachedCard(store, cardId);
    const stored = readHoleQueue(store).filter((item) => item.cardId === cardId);
    queueRef.current = stored;
    setQueue(stored);
    const requested = Number(new URLSearchParams(window.location.search).get("hole"));
    const fromQuery = Number.isInteger(requested) && requested >= 1 ? requested : null;
    if (cached) {
      setCard(cached);
      setHoleNumber(fromQuery ?? cached.missingHoles[0] ?? cached.course.holes[0]?.number ?? 1);
    } else if (fromQuery) {
      setHoleNumber(fromQuery);
    }
    setReady(true);
    const session = readDevice(store, gameDayId);
    let cancelled = false;
    fetchCard(gameDayId, cardId, { deviceToken: session?.deviceToken })
      .then((incoming) => {
        if (cancelled) return;
        const merged = mergeCard(incoming, session?.playerId ?? null);
        setCard(merged);
        cacheCard(store, merged);
        setHoleNumber((current) => current ?? fromQuery ?? merged.missingHoles[0] ?? merged.course.holes[0]?.number ?? 1);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [cardId, gameDayId, store]);

  useEffect(() => {
    const onOnline = () => {
      void flush();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

  function scheduleFlush() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void flush();
    }, 350);
  }

  function strokesFor(current: GameDayCard, hole: number): Record<string, number> {
    if (drafts[hole]) return drafts[hole];
    const saved = current.holes.find((item) => item.number === hole)?.strokes ?? null;
    const par = current.course.holes.find((item) => item.number === hole)?.par ?? 4;
    return initialHoleStrokes(current.players, par, saved);
  }

  function commit(current: GameDayCard, hole: number, strokes: Record<string, number>) {
    const session = readDevice(store, gameDayId);
    if (!session) return;
    const saved = current.holes.find((item) => item.number === hole)?.strokes;
    const unchanged =
      saved &&
      Object.keys(strokes).every((key) => saved[key] === strokes[key]) &&
      Object.keys(saved).every((key) => strokes[key] === saved[key]);
    if (unchanged && !queueRef.current.some((item) => item.holeNumber === hole)) return;
    const item: QueuedHolePut = {
      gameDayId,
      cardId,
      holeNumber: hole,
      clientTimestamp: new Date().toISOString(),
      strokes,
      state: typeof navigator !== "undefined" && navigator.onLine ? "saving" : "offline",
      attempts: 0,
    };
    remember(enqueueHolePut(queueRef.current, item));
    scheduleFlush();
  }

  if (!ready || !card || holeNumber == null) {
    return (
      <GameDayColumn>
        <p className="text-sm text-zinc-500">Opening the card saved on this phone…</p>
      </GameDayColumn>
    );
  }

  const ordered = card.course.holes.map((hole) => hole.number);
  const index = Math.max(0, ordered.indexOf(holeNumber));
  const courseHole = card.course.holes.find((hole) => hole.number === holeNumber);
  const par = courseHole?.par ?? 4;
  const cardQueue = queue.filter((item) => item.cardId === cardId);

  function go(nextHole: number) {
    commit(card!, holeNumber!, strokesFor(card!, holeNumber!));
    setHoleNumber(nextHole);
  }

  if (mode === "review") {
    const open = holesStillOpen(
      ordered,
      card.holes.map((hole) => hole.number),
      cardQueue.map((item) => item.holeNumber),
    );
    const pendingSync = cardQueue.length > 0;
    const blockedReason = pendingSync
      ? "Scores are still on this phone. They'll confirm once they sync."
      : open.length > 0
        ? `Still to score: ${open.join(", ")}`
        : card.scoring
          ? null
          : "Only the scorer can confirm.";
    return (
      <CardReview
        headline={presentGameDay({
          venueName: card.course.name || "Game day",
          date: "",
          headline: card.course.name ? card.course.name.toUpperCase() : "GAME DAY",
        }).headline}
        cardNumber={card.number}
        overallSyncLabel={overallSyncLabel(
          cardQueue.length
            ? cardQueue.map((item) => (item.state === "offline" ? "offline" : "saving"))
            : ["saved"],
        )}
        players={card.players.map((player) => {
          const holes = ordered.map((number) => {
            const queued = cardQueue.find((item) => item.holeNumber === number);
            const saved = card.holes.find((hole) => hole.number === number);
            const strokes = queued?.strokes[String(player.slot)] ?? saved?.strokes[String(player.slot)] ?? drafts[number]?.[String(player.slot)] ?? null;
            const par = card.course.holes.find((hole) => hole.number === number)?.par;
            return { number, strokes: strokes ?? null, par };
          });
          const scored = holes.filter((hole) => hole.strokes != null) as Array<{ number: number; strokes: number }>;
          const gross = scored.length === ordered.length ? grossForSlot(scored.map((hole) => ({ strokes: { [String(player.slot)]: hole.strokes } })), player.slot) : null;
          const parTotal = card.course.holes.reduce((sum, hole) => sum + hole.par, 0);
          const round = gross == null ? null : finishedRound(gross, player.playingHandicap ?? 0, parTotal);
          return {
            slot: player.slot,
            name: player.displayName,
            handicap: formatHandicap(player.handicapIndex),
            holes,
            gross,
            toPar: gross == null ? "–" : formatToPar(gross - parTotal),
            net: player.handicapIndex == null ? null : round?.net ?? null,
            points: round?.stableford ?? null,
            scorer: player.isScorer,
          };
        })}
        onEditHole={(number) => {
          router.push(`${gameDayCardPath(gameDayId, cardId)}?hole=${number}`);
        }}
        canConfirm={blockedReason == null && card.status === "live"}
        confirming={confirming}
        blockedReason={error ?? blockedReason}
        scoreHref={gameDayCardPath(gameDayId, cardId)}
        boardHref={gameDayBoardPath(gameDayId)}
        onConfirm={() => {
          const session = readDevice(store, gameDayId);
          if (!session) return;
          setConfirming(true);
          confirmCard(gameDayId, cardId, session.deviceToken)
            .then((result) => {
              cacheCard(store, mergeCard(result.card, session.playerId));
              router.push(gameDayBoardPath(gameDayId));
            })
            .catch((cause: unknown) => {
              setError(cause instanceof GameDayApiError ? cause.message : "Could not confirm.");
              setConfirming(false);
            });
        }}
      />
    );
  }

  return (
    <>
      <ScoreEntry
        headline={card.course.name ?? "Game day"}
        cardNumber={card.number}
        holeNumber={holeNumber}
        holesPlayed={card.holesPlayed}
        par={par}
        strokeIndex={courseHole?.strokeIndex ?? holeNumber}
        takeoverName={card.scoring ? card.scorer.displayName : null}
        holes={ordered.map((number) => ({
          number,
          sync: card.holes.some((hole) => hole.number === number) || cardQueue.some((item) => item.holeNumber === number)
            ? holeSyncState({
                holeNumber: number,
                queued: cardQueue,
                serverSynced: card.holes.some((hole) => hole.number === number),
              })
            : "open",
        }))}
        players={card.players.map((player) => {
          const strokes = strokesFor(card, holeNumber)[String(player.slot)] ?? par;
          const dots = strokeDotsForPlayer(player.playingHandicap, card.course.holes, holeNumber);
          let totalStrokes = 0;
          let totalPar = 0;
          for (const hole of card.course.holes) {
            if (hole.number > holeNumber) break;
            const value = strokesFor(card, hole.number)[String(player.slot)];
            if (typeof value !== "number") continue;
            totalStrokes += value;
            totalPar += hole.par;
          }
          return {
            slot: player.slot,
            name: player.displayName,
            handicap: formatHandicap(player.handicapIndex),
            strokes,
            dots,
            total: totalStrokes,
            toPar: formatToPar(totalStrokes - totalPar),
            relation: scoreRelation(strokes, par),
            shotChip: shotChipLabel(dots),
          };
        })}
        canScore={card.scoring && card.status === "live"}
        reviewHref={gameDayReviewPath(gameDayId, cardId)}
        boardHref={gameDayBoardPath(gameDayId)}
        onStep={(slot, delta) => {
          if (!card.scoring) return;
          const currentStrokes = strokesFor(card, holeNumber);
          const next = {
            ...currentStrokes,
            [String(slot)]: stepStroke(currentStrokes[String(slot)] ?? par, delta),
          };
          setDrafts((existing) => ({ ...existing, [holeNumber]: next }));
          commit(card, holeNumber, next);
        }}
        onSelectHole={go}
        onNext={() => {
          const lastHole = ordered[ordered.length - 1] ?? holeNumber;
          if (holeNumber >= lastHole) {
            commit(card, holeNumber, strokesFor(card, holeNumber));
            router.push(gameDayReviewPath(gameDayId, cardId));
            return;
          }
          go(ordered[Math.min(ordered.length - 1, index + 1)] ?? holeNumber);
        }}
      />
      {error ? (
        <p role="alert" className="mx-auto max-w-[420px] px-5 pb-8 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </>
  );
}
