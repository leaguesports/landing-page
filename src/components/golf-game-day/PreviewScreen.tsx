"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import {
  fixtureCreated,
  fixtureLeaderboard,
  fixturePreview,
  fixtureResults,
  FIXTURE_DAY_ID,
} from "@/lib/golf-game-day/fixtures";
import { gameDayCardPath, gameDayHeadline, gameDayWeekendPath } from "@/lib/golf-game-day/paths";
import {
  formatHandicap,
  formatToPar,
  scoreRelation,
  shotChipLabel,
  stepStroke,
} from "@/lib/golf-game-day/scoring-ui";
import { CreateGameDay } from "./CreateGameDay";
import { JoinGameDay } from "./JoinGameDay";
import { LeaderboardView } from "./Leaderboard";
import { ResultsView } from "./Results";
import { CardReview } from "./CardReview";
import { ScoreEntry } from "./ScoreEntry";
import { ShareGameDay } from "./ShareGameDay";

const HOLES = Array.from({ length: 18 }, (_, index) => ({
  number: index + 1,
  par: [4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 4, 4, 3, 4, 5, 4, 3, 5][index] ?? 4,
  strokeIndex: index + 1 === 8 ? 9 : index + 1,
}));

const HEADLINE = gameDayHeadline("Zebula Golf Estate & Spa", "2026-11-01");

const SCORE_PLAYERS = [
  { slot: 1, name: "Mike", strokes: 4, total: 30, toPar: "+3", dots: 1 },
  { slot: 2, name: "Sipho", strokes: 5, total: 32, toPar: "+5", dots: 0 },
  { slot: 3, name: "Pieter", strokes: 4, total: 33, toPar: "+6", dots: 0 },
  { slot: 4, name: "Ruan", strokes: 6, total: 36, toPar: "+9", dots: 0 },
];

export function PreviewScreen({ screen }: { screen: string }) {
  const [tab, setTab] = useState<"gross" | "net" | "stableford">("stableford");
  const [strokes, setStrokes] = useState(4);
  const [hole, setHole] = useState(8);

  if (screen === "create") {
    return (
      <CreateGameDay
        preview
        initialDate="2026-11-01"
        initialPlayers={["Brandon", "Sipho"]}
        initialVenueSlug="zebula-golf-estate-spa"
        venues={[
          {
            id: "zebula",
            slug: "zebula-golf-estate-spa",
            name: "Zebula Golf Estate & Spa",
            tees: [
              { name: "White", color: "White" },
              { name: "Yellow", color: "Yellow" },
              { name: "Red", color: "Red" },
            ],
          },
        ]}
      />
    );
  }

  if (screen === "share") {
    return <ShareGameDay day={fixtureCreated()} origin="https://leaguesports.co.za" />;
  }

  if (screen === "join") {
    return (
      <JoinGameDay
        code="ZB47"
        initialPreview={fixturePreview()}
        initialCourse={null}
        previewMode
      />
    );
  }

  if (screen === "joined") {
    const preview = fixturePreview();
    preview.cards = [
      {
        id: "card-1",
        number: 1,
        status: "live",
        openSlots: 0,
        full: true,
        players: [{ displayName: "Brandon", slot: 1, scoring: true }],
      },
      {
        id: "card-2",
        number: 2,
        status: "live",
        openSlots: 0,
        full: true,
        players: [{ displayName: "Sipho", slot: 1, scoring: true }],
      },
    ];
    return (
      <JoinGameDay
        code="ZB47"
        initialPreview={preview}
        initialCourse={null}
        previewMode
        initialPhase="in"
        initialSession={{
          gameDayId: FIXTURE_DAY_ID,
          deviceToken: "preview",
          playerId: "p-mike",
          displayName: "Mike",
          teeName: "White",
          handicapIndex: 6,
        }}
      />
    );
  }

  if (screen === "score") {
    const current = HOLES.find((item) => item.number === hole) ?? HOLES[7]!;
    return (
      <ScoreEntry
        headline={HEADLINE}
        cardNumber={2}
        holeNumber={current.number}
        holesPlayed={18}
        par={current.par}
        strokeIndex={current.strokeIndex}
        takeoverName="Mike"
        holes={HOLES.map((item) => ({
          number: item.number,
          sync: item.number <= 6 ? "saved" : item.number === 7 ? "offline" : "open",
        }))}
        players={SCORE_PLAYERS.map((player) => ({
          slot: player.slot,
          name: player.name,
          handicap: player.slot === 1 ? "hcp 6" : null,
          strokes: player.slot === 1 ? strokes : player.strokes,
          dots: player.dots,
          total: player.total,
          toPar: player.toPar,
          relation: scoreRelation(player.slot === 1 ? strokes : player.strokes, current.par),
          shotChip: shotChipLabel(player.dots),
        }))}
        canScore
        reviewHref="/golf/game-day/preview/review"
        boardHref="/golf/game-day/preview/leaderboard"
        onStep={(_slot, delta) => setStrokes((value) => stepStroke(value, delta))}
        onSelectHole={(number) => {
          setHole(number);
          const next = HOLES.find((item) => item.number === number);
          if (next) setStrokes(next.par);
        }}
        onNext={() => {
          const next = Math.min(18, hole + 1);
          setHole(next);
          setStrokes(HOLES.find((item) => item.number === next)?.par ?? 4);
        }}
      />
    );
  }

  if (screen === "review") {
    const scores = [4, 5, 4, 3, 5, 6, 4, 4, 4, 4, 5, 4, 3, 4, 5, 4, 3, 5];
    const gross = scores.reduce((sum, value) => sum + value, 0);
    const parTotal = HOLES.reduce((sum, item) => sum + item.par, 0);
    return (
      <CardReview
        headline={HEADLINE}
        cardNumber={2}
        overallSyncLabel="Saved"
        players={[
          {
            slot: 1,
            name: "Mike",
            handicap: formatHandicap(6),
            holes: HOLES.map((item, index) => ({ number: item.number, strokes: scores[index] ?? item.par })),
            gross,
            toPar: formatToPar(gross - parTotal),
          },
        ]}
        canConfirm
        confirming={false}
        blockedReason={null}
        scoreHref="/golf/game-day/preview/score"
        boardHref="/golf/game-day/preview/leaderboard"
        onConfirm={() => undefined}
      />
    );
  }

  if (screen === "leaderboard") {
    return (
      <LeaderboardView
        board={fixtureLeaderboard("player")}
        tab={tab}
        onTab={setTab}
        yourCardHref={gameDayCardPath(FIXTURE_DAY_ID, "card-2")}
      />
    );
  }

  if (screen === "desktop") {
    return (
      <LeaderboardView
        board={fixtureLeaderboard("player")}
        tab="stableford"
        onTab={setTab}
        yourCardHref={gameDayCardPath(FIXTURE_DAY_ID, "card-2")}
      />
    );
  }

  if (screen === "spectator") {
    return (
      <LeaderboardView
        board={fixtureLeaderboard("watch")}
        tab={tab}
        onTab={setTab}
        yourCardHref={null}
      />
    );
  }

  if (screen === "results") {
    return (
      <ResultsView
        board={fixtureResults()}
        weekendHref={gameDayWeekendPath("9b6e2c44-1d55-4c2a-9a10-77c1a9d0e221")}
      />
    );
  }

  notFound();
}
