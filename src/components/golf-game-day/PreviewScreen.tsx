"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import {
  CARD_REVIEW_BACK_PAR,
  CARD_REVIEW_FRONT_PAR,
  CARD_REVIEW_LINES,
  fixtureCreated,
  fixtureLeaderboard,
  fixturePreview,
  fixtureResults,
  FIXTURE_DAY_ID,
  sumNine,
} from "@/lib/golf-game-day/fixtures";
import { gameDayCardPath, gameDayHeadline, gameDayWeekendPath } from "@/lib/golf-game-day/paths";
import {
  finishedRound,
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
  par: [4, 5, 4, 3, 4, 5, 4, 4, 4, 4, 4, 4, 3, 4, 5, 4, 3, 5][index] ?? 4,
  strokeIndex: index + 1 === 8 ? 9 : index + 1,
}));

const HEADLINE = gameDayHeadline("Zebula Golf Estate & Spa", "2026-11-01");

const SCORE_PLAYERS = [
  { slot: 1, name: "Mike", strokes: 4, total: 30, toPar: "+3", dots: 1 },
  { slot: 2, name: "Lerato", strokes: 5, total: 35, toPar: "+8", dots: 0 },
  { slot: 3, name: "Pieter", strokes: 4, total: 29, toPar: "+2", dots: 0 },
  { slot: 4, name: "Kabelo", strokes: 5, total: 33, toPar: "+6", dots: 0 },
];

export function PreviewScreen({ screen }: { screen: string }) {
  const [tab, setTab] = useState<"gross" | "net" | "stableford">("stableford");
  const [watchTab, setWatchTab] = useState<"gross" | "net" | "stableford">("net");
  const [strokes, setStrokes] = useState(4);
  const [hole, setHole] = useState(8);

  if (screen === "create") {
    return (
      <CreateGameDay
        preview
        initialDate="2026-11-01"
        initialPlayers={["Brandon", "Sipho", "Jaco", "Thandi", "Mike", "Lerato", "Pieter", "Kabelo", "Nadia"]}
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
    return (
      <ShareGameDay
        day={fixtureCreated()}
        origin="https://leaguesports.co.za"
        cardHref="/golf/game-day/preview/score"
      />
    );
  }

  if (screen === "join") {
    return (
      <JoinGameDay
        code="ZB47"
        initialPreview={fixturePreview()}
        initialCourse={null}
        previewMode
        initialHandicap="6"
      />
    );
  }

  if (screen === "joined") {
    const preview = fixturePreview();
    const card = preview.cards.find((item) => item.number === 2);
    if (card) {
      card.players = [
        { displayName: "Lerato", slot: 2, scoring: false, handicapLabel: "no hcp", teeName: "White" },
        { displayName: "Mike", slot: 1, scoring: false, handicapLabel: "hcp 6", teeName: "White" },
        { displayName: "Pieter", slot: 3, scoring: true, handicapLabel: "hcp 12", teeName: "White" },
      ];
      card.openSlots = 1;
      card.full = false;
      card.teeTime = "08:10 · 1st tee";
    }
    const mike = preview.players.find((player) => player.id === "p-mike");
    if (mike) {
      mike.taken = true;
      mike.cardId = "card-2";
      mike.cardNumber = 2;
    }
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
        takeoverDetail="Pieter's phone switched to view only"
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
    const pars = [...CARD_REVIEW_FRONT_PAR, ...CARD_REVIEW_BACK_PAR];
    return (
      <CardReview
        headline={HEADLINE}
        cardNumber={2}
        overallSyncLabel="Saved"
        players={CARD_REVIEW_LINES.map((line, index) => {
          const strokes = [...line.front, ...line.back];
          const gross = sumNine(line.front) + sumNine(line.back);
          const round = finishedRound(gross, line.playingHandicap);
          return {
            slot: index + 1,
            name: line.name,
            handicap: formatHandicap(line.handicapIndex),
            holes: strokes.map((value, holeIndex) => ({
              number: holeIndex + 1,
              strokes: value,
              par: pars[holeIndex],
            })),
            gross,
            toPar: formatToPar(round.toPar),
            net: line.handicapIndex == null ? null : round.net,
            points: round.stableford,
            scorer: line.scorer,
          };
        })}
        canConfirm
        confirming={false}
        blockedReason={null}
        scoreHref="/golf/game-day/preview/score"
        boardHref="/golf/game-day/preview/leaderboard"
        onConfirm={() => undefined}
        onEditHole={() => undefined}
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
        layout="phone"
      />
    );
  }

  if (screen === "desktop") {
    return (
      <LeaderboardView
        board={fixtureLeaderboard("watch")}
        tab="stableford"
        onTab={setTab}
        yourCardHref={null}
        layout="desktop"
      />
    );
  }

  if (screen === "spectator") {
    return (
      <LeaderboardView
        board={fixtureLeaderboard("watch")}
        tab={watchTab}
        onTab={setWatchTab}
        yourCardHref={null}
        layout="phone"
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
