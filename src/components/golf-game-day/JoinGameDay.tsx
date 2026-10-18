"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameDayPreview, JoinResult } from "@/types/golf-game-day";
import type { GolfCourseCms } from "@/types/golf-round";
import { loadGolfCourseByVenueCmsId } from "@/app/golf/actions";
import {
  fetchInvite,
  GameDayApiError,
  joinCard,
  joinGameDay,
  startCard,
  takeOverCard,
} from "@/lib/golf-game-day/api";
import { gameDayBoardPath, gameDayCardPath, presentGameDay } from "@/lib/golf-game-day/paths";
import { gameDayCardStartBody, mergeCard } from "@/lib/golf-game-day/scoring-ui";
import { parseGolfHandicapIndex } from "@/lib/golf/handicap";
import {
  cacheCard,
  cacheCourse,
  localStorageStore,
  readCachedCourse,
  readDevice,
  writeDevice,
} from "@/lib/golf-game-day/storage";
import { useGameDayAction } from "./GameDayChrome";
import {
  ChoiceChip,
  Eyebrow,
  FieldLabel,
  GameDayColumn,
  OutlineButton,
  PrimaryButton,
  ScreenTitle,
  teeDotClass,
  textFieldClass,
} from "./ui";

type JoinGameDayProps = {
  code: string;
  initialPreview: GameDayPreview | null;
  initialCourse: GolfCourseCms | null;
  previewMode?: boolean;
  initialPhase?: "join" | "in";
  initialSession?: JoinResult | null;
};

export function JoinGameDay({
  code,
  initialPreview,
  initialCourse,
  previewMode = false,
  initialPhase = "join",
  initialSession = null,
}: JoinGameDayProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(initialPreview);
  const [course, setCourse] = useState(initialCourse);
  const [phase, setPhase] = useState<"join" | "in">(initialPhase);
  const [playerId, setPlayerId] = useState<string | "new">(
    initialPreview?.players.find((player) => !player.taken)?.id ?? "new",
  );
  const [addedName, setAddedName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [tee, setTee] = useState(initialPreview?.defaultTee ?? "");
  const [session, setSession] = useState(initialSession);
  const [courseSaved, setCourseSaved] = useState(previewMode && initialPhase === "in");
  const [cardChoice, setCardChoice] = useState<string>(() => {
    const openCard = initialPreview?.cards.find((card) => !card.full);
    return openCard?.id ?? (initialPreview ? "new" : "");
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const boardHref = preview ? gameDayBoardPath(preview.id) : "/login";
  useGameDayAction(phase === "in" ? "Board" : "Sign in", phase === "in" ? boardHref : "/login");

  useEffect(() => {
    if (previewMode || !preview) return;
    const store = localStorageStore();
    const existing = readDevice(store, preview.id);
    if (existing) {
      setSession({
        gameDayId: existing.gameDayId,
        deviceToken: existing.deviceToken,
        playerId: existing.playerId,
        displayName: existing.displayName,
        teeName: existing.teeName,
        handicapIndex: existing.handicapIndex,
      });
      setPhase("in");
    }
    if (course) {
      cacheCourse(store, {
        gameDayId: preview.id,
        venueCmsId: preview.venueCmsId,
        venueName: preview.venueName,
        course,
        savedAt: new Date().toISOString(),
      });
      setCourseSaved(true);
    } else {
      const cached = readCachedCourse(store, preview.id);
      if (cached?.course) {
        setCourse(cached.course);
        setCourseSaved(true);
      }
    }
  }, [course, preview, previewMode]);

  useEffect(() => {
    if (preview || previewMode) return;
    let cancelled = false;
    fetchInvite(code)
      .then((next) => {
        if (cancelled) return;
        setPreview(next);
        setTee(next.defaultTee);
        const openCard = next.cards.find((card) => !card.full);
        setCardChoice(openCard?.id ?? "new");
        const open = next.players.find((player) => !player.taken);
        if (open) setPlayerId(open.id);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof GameDayApiError ? cause.message : "Game day not found");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, preview, previewMode]);

  useEffect(() => {
    if (previewMode || course || !preview?.venueCmsId) return;
    let cancelled = false;
    loadGolfCourseByVenueCmsId(preview.venueCmsId)
      .then((next) => {
        if (!cancelled && next) setCourse(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [course, preview, previewMode]);

  async function onJoin() {
    if (!preview) return;
    if (previewMode) {
      setSession({
        gameDayId: preview.id,
        deviceToken: "preview-token",
        playerId: playerId === "new" ? "preview-player" : playerId,
        displayName: playerId === "new" ? addedName || "Mike" : preview.players.find((player) => player.id === playerId)?.displayName || "Mike",
        teeName: tee || preview.defaultTee,
        handicapIndex: null,
      });
      setCourseSaved(true);
      setPhase("in");
      return;
    }
    const parsed = parseGolfHandicapIndex(handicap);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (playerId === "new" && !addedName.trim()) {
      setError("Add your name.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const joined = await joinGameDay(code, {
        ...(playerId === "new" ? { displayName: addedName.trim() } : { playerId }),
        handicapIndex: parsed.value,
        teeName: tee || preview.defaultTee,
      });
      const store = localStorageStore();
      writeDevice(store, {
        ...joined,
        inviteCode: code,
        cardId: null,
      });
      if (course) {
        cacheCourse(store, {
          gameDayId: preview.id,
          venueCmsId: preview.venueCmsId,
          venueName: preview.venueName,
          course,
          savedAt: new Date().toISOString(),
        });
        setCourseSaved(true);
      }
      setSession(joined);
      if (cardChoice && cardChoice !== "new") {
        try {
          const seated = await joinCard(preview.id, cardChoice, joined.deviceToken);
          cacheCard(store, mergeCard(seated.card, joined.playerId));
          writeDevice(store, {
            ...joined,
            inviteCode: code,
            cardId: cardChoice,
          });
        } catch (cause) {
          setError(cause instanceof GameDayApiError ? cause.message : "Could not join that card.");
        }
      }
      setPhase("in");
      const fresh = await fetchInvite(code).catch(() => preview);
      setPreview(fresh);
    } catch (cause) {
      setError(cause instanceof GameDayApiError ? cause.message : "Could not join.");
    } finally {
      setPending(false);
    }
  }

  async function onStart() {
    if (!preview || !session) return;
    if (previewMode) {
      router.push("/golf/game-day/preview/score");
      return;
    }
    const store = localStorageStore();
    const cached = course ?? readCachedCourse(store, preview.id)?.course ?? null;
    if (!cached) {
      setError("Course isn't on this phone yet. Reconnect once, then start the card.");
      return;
    }
    const body = gameDayCardStartBody({
      course: cached,
      teeOptions: preview.teeOptions,
      playerTee: session.teeName,
    });
    if (!body) {
      setError("This course scorecard isn't complete yet.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const started = await startCard(preview.id, session.deviceToken, body);
      const card = mergeCard(started.card, session.playerId);
      cacheCard(store, card);
      writeDevice(store, {
        gameDayId: session.gameDayId,
        deviceToken: session.deviceToken,
        playerId: session.playerId,
        displayName: session.displayName,
        teeName: session.teeName,
        handicapIndex: session.handicapIndex,
        inviteCode: code,
        cardId: card.id,
      });
      router.push(gameDayCardPath(preview.id, card.id));
    } catch (cause) {
      setError(cause instanceof GameDayApiError ? cause.message : "Could not start the card.");
      setPending(false);
    }
  }

  async function onJoinCard(cardId: string) {
    if (!preview || !session || previewMode) return;
    setPending(true);
    setError(null);
    try {
      const joined = await joinCard(preview.id, cardId, session.deviceToken);
      const store = localStorageStore();
      cacheCard(store, mergeCard(joined.card, session.playerId));
      writeDevice(store, {
        gameDayId: session.gameDayId,
        deviceToken: session.deviceToken,
        playerId: session.playerId,
        displayName: session.displayName,
        teeName: session.teeName,
        handicapIndex: session.handicapIndex,
        inviteCode: code,
        cardId,
      });
      const fresh = await fetchInvite(code).catch(() => preview);
      setPreview(fresh);
    } catch (cause) {
      setError(cause instanceof GameDayApiError ? cause.message : "Could not join that card.");
    } finally {
      setPending(false);
    }
  }

  async function onTakeOver(cardId: string) {
    if (!preview || !session) return;
    if (previewMode) {
      router.push("/golf/game-day/preview/score");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await takeOverCard(preview.id, cardId, session.deviceToken);
      router.push(gameDayCardPath(preview.id, cardId));
    } catch (cause) {
      setError(cause instanceof GameDayApiError ? cause.message : "Could not take over scoring.");
      setPending(false);
    }
  }

  if (!preview) {
    return (
      <GameDayColumn>
        <ScreenTitle>Join the game</ScreenTitle>
        <p role="alert" className="mt-4 text-sm text-zinc-600">
          {error ?? "Looking for that game day…"}
        </p>
      </GameDayColumn>
    );
  }

  const shown = presentGameDay(preview);
  const nextCard = (preview.cards.reduce((max, card) => Math.max(max, card.number), 0) || 0) + 1;
  const selectedName =
    playerId === "new"
      ? addedName.trim() || "me"
      : preview.players.find((player) => player.id === playerId)?.displayName || "me";
  const chosenCard = preview.cards.find((card) => card.id === cardChoice) ?? null;
  const joinLabel = chosenCard
    ? `Join Card ${chosenCard.number} as ${selectedName}`
    : `Start card ${nextCard} as ${selectedName}`;

  if (phase === "in" && session) {
    const me = preview.players.find((player) => player.id === session.playerId);
    const seatedCard =
      preview.cards.find((card) => card.id === me?.cardId) ??
      preview.cards.find((card) =>
        card.players.some(
          (player) => player.displayName.toLowerCase() === session.displayName.toLowerCase(),
        ),
      );
    return (
      <GameDayColumn>
        <Eyebrow>{shown.headline}</Eyebrow>
        <ScreenTitle>You&apos;re in</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">
          {session.displayName} · {session.teeName} tees
        </p>
        {courseSaved ? (
          <p className="mt-3 text-sm font-semibold text-green-800">
            ✓ Course and your card saved on this phone
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            Still fetching the course. You can join once it&apos;s saved.
          </p>
        )}

        <div className="mt-8 space-y-3">
          {preview.cards.filter((card) => !card.full && card.id !== seatedCard?.id).map((card) => (
            <OutlineButton
              key={card.id}
              type="button"
              disabled={pending}
              onClick={() => onJoinCard(card.id)}
            >
              Join card {card.number}
            </OutlineButton>
          ))}
          {seatedCard ? (
            <PrimaryButton type="button" disabled={pending} onClick={() => onTakeOver(seatedCard.id)}>
              {seatedCard.players.some((player) => player.scoring && player.displayName === session.displayName)
                ? "Back to scoring"
                : "Take over scoring"}
            </PrimaryButton>
          ) : (
            <PrimaryButton type="button" disabled={pending || (!previewMode && !courseSaved)} onClick={onStart}>
              Start card {nextCard}
            </PrimaryButton>
          )}
        </div>
        <p className="mt-4 text-sm text-zinc-500">Take over scoring if you need to.</p>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <a href={gameDayBoardPath(preview.id)} className="mt-8 block text-center text-sm font-semibold">
          Leaderboard
        </a>
      </GameDayColumn>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[420px] flex-col">
      <div className="flex-1 px-5 pb-4 pt-6">
        <Eyebrow>You&apos;re invited · code {code}</Eyebrow>
        <ScreenTitle>Join the game</ScreenTitle>
        <p className="mt-3 text-sm text-zinc-600">
          {shown.place} · {shown.dateLabel}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          {shown.place} · {preview.format === "stroke" ? "Stroke play" : preview.format}
        </p>

        <fieldset className="mt-6">
          <legend>
            <FieldLabel>Your name</FieldLabel>
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {preview.players.map((player) => {
              const selected = playerId === player.id;
              const status = selected && !player.taken
                ? "That's me"
                : player.cardNumber
                  ? `✓ Card ${player.cardNumber}`
                  : "Not joined";
              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={player.taken}
                  aria-pressed={selected}
                  onClick={() => setPlayerId(player.id)}
                  className={
                    player.taken
                      ? "min-h-[4.5rem] rounded-2xl border border-zinc-200 px-2 py-2 text-left text-zinc-400"
                      : selected
                        ? "min-h-[4.5rem] rounded-2xl bg-zinc-950 px-2 py-2 text-left text-white"
                        : "min-h-[4.5rem] rounded-2xl border border-zinc-300 bg-white px-2 py-2 text-left text-zinc-950"
                  }
                >
                  <span className="block text-sm font-semibold">{player.displayName}</span>
                  <span className={`mt-1 block text-[11px] ${selected ? "text-white/80" : "text-zinc-500"}`}>
                    {status}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={playerId === "new"}
              onClick={() => setPlayerId("new")}
              className={
                playerId === "new"
                  ? "min-h-[4.5rem] rounded-2xl bg-zinc-950 px-2 py-2 text-left text-sm font-semibold text-white"
                  : "min-h-[4.5rem] rounded-2xl border border-dashed border-zinc-400 bg-white px-2 py-2 text-left text-sm font-semibold text-zinc-950"
              }
            >
              Add me
            </button>
          </div>
          {playerId === "new" ? (
            <input
              value={addedName}
              onChange={(event) => setAddedName(event.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className={textFieldClass()}
            />
          ) : null}
        </fieldset>

        <label className="mt-5 flex items-center justify-between gap-3">
          <FieldLabel>Handicap · optional</FieldLabel>
          <input
            value={handicap}
            onChange={(event) => setHandicap(event.target.value)}
            inputMode="decimal"
            placeholder="e.g. 6"
            aria-label="Handicap"
            className="w-24 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-right text-sm text-zinc-950"
          />
        </label>

        <fieldset className="mt-5 rounded-2xl border border-dashed border-zinc-400 p-4">
          <legend className="sr-only">Your tee</legend>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Your tee</FieldLabel>
            <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Option
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">organiser&apos;s: {preview.defaultTee}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {preview.teeOptions.map((option) => (
              <ChoiceChip
                key={option}
                selected={(tee || preview.defaultTee) === option}
                onClick={() => setTee(option)}
              >
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${teeDotClass(option)}`} />
                {option}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>

        <section className="mt-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Pick a card
          </h2>
          <div className="mt-3 space-y-2">
            {preview.cards.map((card) => {
              const seats = card.players.length;
              const selected = cardChoice === card.id;
              const members = card.players
                .map((player) => {
                  const you =
                    selectedName.toLowerCase() === player.displayName.toLowerCase() ? " (+ you)" : "";
                  const scoring = player.scoring ? " · scoring" : "";
                  return `${player.displayName}${you}${scoring}`;
                })
                .join(", ");
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCardChoice(card.id)}
                  className={
                    selected
                      ? "w-full rounded-2xl bg-zinc-950 px-4 py-3 text-left text-white"
                      : "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950"
                  }
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                    <span>Card {card.number}</span>
                    <span className="text-[11px] uppercase tracking-[0.12em]">
                      {card.full ? "Full" : "Open"} {seats}/4
                    </span>
                  </span>
                  <span className={`mt-1 block text-sm ${selected ? "text-white/80" : "text-zinc-600"}`}>
                    {members}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={cardChoice === "new"}
              onClick={() => setCardChoice("new")}
              className={
                cardChoice === "new"
                  ? "w-full rounded-2xl bg-zinc-950 px-4 py-3 text-left text-sm font-semibold text-white"
                  : "w-full rounded-2xl border border-dashed border-zinc-400 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-950"
              }
            >
              Start new card · you&apos;ll score
            </button>
          </div>
        </section>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-5 py-3">
        <PrimaryButton type="button" disabled={pending} onClick={onJoin}>
          {pending ? "Joining…" : joinLabel}
        </PrimaryButton>
        <p className="mt-2 text-center text-xs text-zinc-500">No account needed.</p>
      </div>
    </div>
  );
}
