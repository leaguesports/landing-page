"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, List, Plus, Smartphone } from "lucide-react";
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
  Eyebrow,
  GameDayColumn,
  PrimaryButton,
  ScreenTitle,
  teeDotClass,
  textFieldClass,
} from "./ui";

const JOIN_TILES = ["Brandon", "Sipho", "Jaco", "Thandi", "Mike", "Lerato", "Pieter", "Kabelo", "Nadia"];

function joinTileOrder(name: string): number {
  const index = JOIN_TILES.indexOf(name);
  return index === -1 ? JOIN_TILES.length : index;
}

type JoinGameDayProps = {
  code: string;
  initialPreview: GameDayPreview | null;
  initialCourse: GolfCourseCms | null;
  previewMode?: boolean;
  initialPhase?: "join" | "in";
  initialSession?: JoinResult | null;
  initialHandicap?: string;
};

export function JoinGameDay({
  code,
  initialPreview,
  initialCourse,
  previewMode = false,
  initialPhase = "join",
  initialSession = null,
  initialHandicap = "",
}: JoinGameDayProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(initialPreview);
  const [course, setCourse] = useState(initialCourse);
  const [phase, setPhase] = useState<"join" | "in">(initialPhase);
  const [playerId, setPlayerId] = useState<string | "new">(
    initialPreview?.players.find((player) => !player.taken)?.id ?? "new",
  );
  const [addedName, setAddedName] = useState("");
  const [handicap, setHandicap] = useState(initialHandicap);
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
    const scorer = seatedCard?.players.find((player) => player.scoring) ?? null;
    const seatedPlayers = seatedCard?.players ?? [];
    const openSpots = seatedCard?.openSlots ?? 0;
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col">
        <div className="flex-1 px-5 pb-6 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006045]">
            You&apos;re in{seatedCard ? ` · Card ${seatedCard.number}` : ""}
          </p>
          <h1 className="mt-2 font-display text-[42px] leading-none tracking-wide text-zinc-950">
            Hi {session.displayName}
          </h1>

          {courseSaved ? (
            <div className="relative mt-4 rounded-2xl border border-zinc-950 bg-[#dcfce7] px-4 py-3">
              <span className="absolute -top-2.5 right-4 rounded-full border border-zinc-950 bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
                New
              </span>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                  <Smartphone className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-950">Course & card saved to this phone</p>
                  <p className="mt-1 text-sm text-zinc-800">
                    Works without signal. Scores sync when you&apos;re back in coverage.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Still fetching the course. You can score once it&apos;s saved.</p>
          )}

          {seatedCard ? (
            <section className="mt-4" aria-label={`Card ${seatedCard.number}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-base font-bold text-zinc-950">Card {seatedCard.number}</h2>
                {seatedCard.teeTime ? (
                  <p className="text-sm text-zinc-700">tee time {seatedCard.teeTime}</p>
                ) : null}
              </div>
              <ul className="mt-3 overflow-hidden rounded-2xl border border-zinc-300">
                {seatedPlayers.map((player) => {
                  const you = player.displayName.toLowerCase() === session.displayName.toLowerCase();
                  const detail = [
                    player.handicapLabel ??
                      (you && session.handicapIndex != null ? `hcp ${session.handicapIndex}` : "no hcp"),
                    player.teeName || session.teeName || "",
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li
                      key={`${player.displayName}-${player.slot}`}
                      className="flex items-center gap-3 border-b border-zinc-200 px-4 py-2 last:border-b-0"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
                        {player.displayName.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2 font-semibold text-zinc-950">
                          {player.displayName}
                          {player.scoring ? (
                            <span className="rounded-full bg-zinc-950 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-white">
                              Scoring
                            </span>
                          ) : null}
                          {you ? (
                            <span className="rounded-full border border-zinc-950 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-zinc-950">
                              You
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-sm text-zinc-600">{detail}</span>
                      </span>
                    </li>
                  );
                })}
                {openSpots > 0 ? (
                  <li className="px-4 py-2 text-sm font-semibold text-zinc-500">+ {openSpots} open spot</li>
                ) : null}
              </ul>
              {scorer ? (
                <div className="mt-3 rounded-2xl bg-zinc-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-950">{scorer.displayName} is scoring</p>
                    <span className="rounded-full bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
                      New
                    </span>
                  </div>
                  <div className="mt-2 flex items-start gap-3">
                    <ArrowLeftRight className="mt-0.5 h-5 w-5 shrink-0 text-zinc-950" aria-hidden />
                    <p className="text-sm text-zinc-800">
                      Battery low or swapping? Anyone on the card can take over. Scores so far stay.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTakeOver(seatedCard.id)}
                    disabled={pending}
                    className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Take over scoring
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-5">
            {seatedCard ? (
              <a
                href={gameDayBoardPath(preview.id)}
                className="inline-flex min-h-16 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-base font-semibold text-zinc-950"
              >
                <List className="h-5 w-5" aria-hidden />
                Open live leaderboard
              </a>
            ) : (
              <PrimaryButton type="button" disabled={pending || (!previewMode && !courseSaved)} onClick={onStart}>
                Start card {nextCard}
              </PrimaryButton>
            )}
          </div>
        </div>
        <div className="border-t border-zinc-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col">
      <div className="flex-1 px-5 pb-4 pt-6">
        <Eyebrow>You&apos;re invited · code {code}</Eyebrow>
        <ScreenTitle>{shown.headline}</ScreenTitle>
        <p className="mt-2 text-sm font-semibold text-zinc-950">
          {preview.venueName} · {preview.format === "stroke" ? "Stroke play" : preview.format}
        </p>

        <fieldset className="mt-6">
          <legend className="flex w-full items-center justify-between gap-2">
            <span className="text-sm font-semibold text-zinc-950">Tap your name</span>
            <span className="rounded-full bg-[#3dff8a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-950">
              New
            </span>
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[...preview.players]
              .sort((a, b) => joinTileOrder(a.displayName) - joinTileOrder(b.displayName))
              .map((player) => {
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
                      ? "flex min-h-[4.75rem] flex-col items-center justify-center rounded-2xl border border-zinc-300 bg-zinc-100 px-1 py-2 text-center text-zinc-600"
                      : selected
                        ? "flex min-h-[4.75rem] flex-col items-center justify-center rounded-2xl bg-zinc-950 px-1 py-2 text-center text-white"
                        : "flex min-h-[4.75rem] flex-col items-center justify-center rounded-2xl border border-zinc-300 bg-white px-1 py-2 text-center text-zinc-950"
                  }
                >
                  <span className="block text-sm font-semibold">{player.displayName}</span>
                  <span className={`mt-1 block text-[11px] ${selected && !player.taken ? "font-semibold text-[#3dff8a]" : "text-zinc-500"}`}>
                    {status}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-pressed={playerId === "new"}
            onClick={() => setPlayerId("new")}
            className={
              playerId === "new"
                ? "mt-2 flex min-h-14 w-full items-center justify-center rounded-2xl bg-zinc-950 px-3 text-sm font-semibold text-white"
                : "mt-2 flex min-h-14 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-400 bg-white px-3 text-sm font-semibold text-zinc-950"
            }
          >
            <span className="font-bold">+ Add me</span>
            <span className="font-normal"> · not on the list</span>
          </button>
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
          <span className="text-sm font-semibold text-zinc-950">Handicap optional</span>
          <input
            value={handicap}
            onChange={(event) => setHandicap(event.target.value)}
            inputMode="decimal"
            placeholder="6"
            aria-label="Handicap"
            className="h-14 w-24 rounded-2xl border border-zinc-950 bg-white px-3 text-center text-lg font-semibold text-zinc-950"
          />
        </label>

        <fieldset className="mt-5 rounded-2xl border border-dashed border-zinc-400 p-4">
          <legend className="sr-only">Your tee</legend>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950">
              Your tee
              <span className="rounded-full border border-dashed border-zinc-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                Option
              </span>
            </span>
            <span className="text-sm text-zinc-500">organiser&apos;s: {preview.defaultTee}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {preview.teeOptions.map((option) => {
              const selected = (tee || preview.defaultTee) === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTee(option)}
                  className={
                    selected
                      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-2 text-sm font-semibold text-white"
                      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-2 text-sm font-semibold text-zinc-950"
                  }
                >
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${teeDotClass(option)}`} />
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-950">Pick a card</h2>
          <div className="mt-3 space-y-2">
            {preview.cards.map((card) => {
              const seats = card.players.length;
              const selected = cardChoice === card.id;
              const names = card.players.map((player) =>
                player.scoring ? `${player.displayName} (scoring)` : player.displayName,
              );
              const joining =
                selected &&
                !card.players.some(
                  (player) => player.displayName.toLowerCase() === selectedName.toLowerCase(),
                );
              const open = Math.max(card.openSlots, 4 - card.players.length);
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCardChoice(card.id)}
                  className={
                    selected
                      ? "w-full rounded-2xl border-2 border-zinc-950 bg-white px-4 py-3 text-left text-zinc-950"
                      : card.full
                        ? "w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-left text-zinc-950"
                        : "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950"
                  }
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                    <span className="inline-flex items-center gap-2">
                      {card.full ? null : (
                        <span
                          className={
                            selected
                              ? "inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-950"
                              : "inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-400"
                          }
                          aria-hidden
                        >
                          {selected ? <span className="h-2.5 w-2.5 rounded-full bg-zinc-950" /> : null}
                        </span>
                      )}
                      Card {card.number}
                    </span>
                    <span className="text-xs font-semibold text-zinc-600">
                      {card.full ? `Full · ${seats}/4` : `${seats}/4 · ${open} open`}
                    </span>
                  </span>
                  <span className={`mt-1 block text-sm text-zinc-600 ${card.full ? "" : "pl-7"}`}>
                    {names.join(", ")}
                    {joining ? <span className="font-bold text-zinc-950">, + you</span> : null}
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
                  ? "inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-zinc-950 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-950"
                  : "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-400 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-950"
              }
            >
              <Plus className="h-4 w-4" aria-hidden />
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
