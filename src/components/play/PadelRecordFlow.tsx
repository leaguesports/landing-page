"use client";

/**
 * MOCK Record a match. Steps stay on /play. No network.
 */

import { PADEL_MOCK_VENUES, padelMockPlayer } from "@/lib/play/mock/padel-mock-data";
import {
  PADEL_MOCK_SHARE_TOAST,
  buildSavedMatch,
  summaryFromDraft,
  summaryFromMatch,
  type PadelSummary,
  type SavedPadelMatch,
} from "@/lib/play/mock/padel-match-store";
import {
  assignPlayer,
  availablePlayers,
  initialPadelDraft,
  removePlayer,
  setDraftFormat,
  setDraftVenue,
  shortPlayerList,
  slotCount,
  teamsReady,
  type PadelDraft,
  type PadelFormat,
} from "@/lib/play/mock/padel-record";
import {
  canSaveMatch,
  canStepGames,
  canStepTiebreak,
  formatSetLine,
  matchWinner,
  replaceSet,
  setWinner,
  stepGames,
  stepTiebreak,
  tiebreakOpen,
  visibleSetCount,
  type PadelSet,
  type PadelSide,
} from "@/lib/play/mock/padel-score";
import { useState } from "react";

type Step = "players" | "score" | "review" | "done";

const STEP_TITLE: Record<Exclude<Step, "done">, string> = {
  players: "Who played",
  score: "The score",
  review: "Review",
};

function initials(name: string): string {
  if (name === "You") return "Y";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() ?? "";
}

function createMatchId(): string {
  const random = globalThis.crypto?.randomUUID?.();
  return random ? `mock-${random}` : `mock-${Date.now()}`;
}

function namedPlayers(ids: readonly string[]) {
  return ids.flatMap((id) => {
    const player = padelMockPlayer(id);
    return player ? [player] : [];
  });
}

function Stepper({
  value,
  caption,
  setIndex,
  side,
  kind,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: {
  value: number;
  caption: string;
  setIndex: number;
  side: PadelSide;
  kind: "games" | "tiebreak";
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const which = kind === "tiebreak" ? "tiebreak points" : "games";
  return (
    <div>
      <div className="stepper">
        <button
          type="button"
          data-set={setIndex}
          data-side={side}
          data-kind={kind}
          data-step="down"
          aria-label={`Decrease Team ${side} ${which} for set ${setIndex + 1}`}
          disabled={!canDecrease}
          onClick={onDecrease}
        >
          −
        </button>
        <span className="n">{value}</span>
        <button
          type="button"
          data-set={setIndex}
          data-side={side}
          data-kind={kind}
          data-step="up"
          aria-label={`Increase Team ${side} ${which} for set ${setIndex + 1}`}
          disabled={!canIncrease}
          onClick={onIncrease}
        >
          +
        </button>
      </div>
      <p className="side-name">{caption}</p>
    </div>
  );
}

function SummaryCard({ summary }: { summary: PadelSummary }) {
  const rows = [
    ["Team A", summary.teamA],
    ["Team B", summary.teamB],
    ["Winner", summary.winner],
    ["Venue", summary.venue],
    ["Date", summary.date],
  ] as const;
  return (
    <div className="summary">
      <p className="summary-format">
        {summary.formatLabel}
        <span className="demo-tag">Demo</span>
      </p>
      <div className="set-lines">
        {summary.sets.map((line, index) => (
          <p key={`${index}-${line}`}>{line}</p>
        ))}
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PadelRecordFlow({
  onExit,
  onSave,
}: {
  onExit: () => void;
  onSave: (match: SavedPadelMatch) => boolean;
}) {
  const [step, setStep] = useState<Step>("players");
  const [draft, setDraft] = useState<PadelDraft>(initialPadelDraft);
  const [saved, setSaved] = useState<SavedPadelMatch | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [playedOn, setPlayedOn] = useState<Date | null>(null);

  function back() {
    if (step === "score") setStep("players");
    else if (step === "review") setStep("score");
    else onExit();
  }

  function changeGames(index: number, side: PadelSide, delta: 1 | -1) {
    setDraft((current) => {
      const set = current.sets[index];
      if (!set) return current;
      return { ...current, sets: replaceSet(current.sets, index, stepGames(set, side, delta)) };
    });
  }

  function changeTiebreak(index: number, side: PadelSide, delta: 1 | -1) {
    setDraft((current) => {
      const set = current.sets[index];
      if (!set) return current;
      return { ...current, sets: replaceSet(current.sets, index, stepTiebreak(set, side, delta)) };
    });
  }

  function save() {
    const match = buildSavedMatch(draft, { id: createMatchId(), now: playedOn ?? new Date() });
    if (!match || !onSave(match)) return;
    setSaved(match);
    setToast(null);
    setStep("done");
  }

  function recordAnother() {
    setPlayedOn(null);
    setDraft(initialPadelDraft());
    setSaved(null);
    setToast(null);
    setStep("players");
  }

  const teamA = namedPlayers(draft.teamA);
  const teamB = namedPlayers(draft.teamB);
  const shortA = teamA.length ? shortPlayerList(teamA) : "Team A";
  const shortB = teamB.length ? shortPlayerList(teamB) : "Team B";
  const ready = teamsReady(draft);
  const winner = matchWinner(draft.sets);
  const review = step === "review" && playedOn ? summaryFromDraft(draft, playedOn) : null;
  const done = saved ? summaryFromMatch(saved) : null;
  const title = step === "done" ? (done ? `${done.winner} won` : "Saved") : STEP_TITLE[step];
  const openSets = draft.sets.slice(0, visibleSetCount(draft.sets));

  return (
    <section className="padel-record" aria-label="Record a match" data-flow-step={step} data-padel-mock="on">
      <div className="flow-head">
        <button type="button" className="back" onClick={back}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          {step === "players" || step === "done" ? "Padel" : "Back"}
        </button>
        <span className="demo-tag">Demo</span>
      </div>
      <p className="hello">{step === "done" ? "Saved" : "Record a match"}</p>
      <h1>{title}</h1>

      {step === "players" ? (
        <>
          <div className="seg" role="radiogroup" aria-label="Format">
            {(["singles", "doubles"] as const).map((format: PadelFormat) => (
              <button
                key={format}
                type="button"
                role="radio"
                aria-checked={draft.format === format}
                data-format={format}
                onClick={() => setDraft((current) => setDraftFormat(current, format))}
              >
                {format === "singles" ? "Singles" : "Doubles"}
              </button>
            ))}
          </div>
          <TeamBlock
            label="Team A"
            ids={draft.teamA}
            slots={slotCount(draft.format)}
            onRemove={(id) => setDraft((current) => removePlayer(current, id))}
          />
          <TeamBlock
            label="Team B"
            ids={draft.teamB}
            slots={slotCount(draft.format)}
            onRemove={(id) => setDraft((current) => removePlayer(current, id))}
          />
          <p className="lbl picks-label">Add a player</p>
          {availablePlayers(draft).length === 0 ? (
            <p className="hint">Teams are full.</p>
          ) : (
            <div className="picks">
              {availablePlayers(draft).map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className="pick"
                  data-player={player.id}
                  onClick={() => setDraft((current) => assignPlayer(current, player.id))}
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}
          <p className="lbl picks-label">Venue</p>
          <p className="hint">Optional</p>
          <div className="picks">
            {PADEL_MOCK_VENUES.map((venue) => (
              <button
                key={venue.id}
                type="button"
                className="pick"
                data-venue={venue.id}
                aria-pressed={draft.venueId === venue.id}
                onClick={() => setDraft((current) => setDraftVenue(current, venue.id))}
              >
                {venue.name}
              </button>
            ))}
          </div>
          <button type="button" className="cta" disabled={!ready} onClick={() => setStep("score")}>
            Continue
          </button>
        </>
      ) : null}

      {step === "score" ? (
        <>
          {openSets.map((set, index) => (
            <SetCard
              key={index}
              index={index}
              set={set}
              shortA={shortA}
              shortB={shortB}
              onGames={changeGames}
              onTiebreak={changeTiebreak}
            />
          ))}
          {winner ? (
            <p className="decided" role="status">
              Winner · Team {winner}
            </p>
          ) : (
            <p className="hint score-hint">Enter sets until one team wins two. A tiebreak appears at 6-6.</p>
          )}
          <button
            type="button"
            className="cta"
            disabled={!canSaveMatch(draft.sets)}
            onClick={() => {
              setPlayedOn((current) => current ?? new Date());
              setStep("review");
            }}
          >
            Review
          </button>
        </>
      ) : null}

      {step === "review" && review ? (
        <>
          <SummaryCard summary={review} />
          <button type="button" className="cta" disabled={!canSaveMatch(draft.sets)} onClick={save}>
            Save
          </button>
        </>
      ) : null}

      {step === "done" && done ? (
        <>
          <p className="scoreline">{done.scoreLine}</p>
          <p className="versus">{done.teamA}</p>
          <p className="beat">defeated</p>
          <p className="versus">{done.teamB}</p>
          <p className="meta">
            {done.venue} · {done.date}
          </p>
          <button type="button" className="cta" onClick={() => setToast(PADEL_MOCK_SHARE_TOAST)}>
            Share
          </button>
          {toast ? (
            <p className="toast" role="status" data-share-toast="">
              <span className="dot" aria-hidden />
              {toast}
            </p>
          ) : null}
          <button type="button" className="sec" onClick={recordAnother}>
            Record another
          </button>
          <button type="button" className="sec" onClick={onExit}>
            Back to padel
          </button>
        </>
      ) : null}
    </section>
  );
}

function TeamBlock({
  label,
  ids,
  slots,
  onRemove,
}: {
  label: string;
  ids: readonly string[];
  slots: number;
  onRemove: (id: string) => void;
}) {
  const players = namedPlayers(ids);
  const empty = Math.max(0, slots - players.length);
  return (
    <section className="team" aria-label={label}>
      <p className="lbl">{label}</p>
      {players.map((player) => (
        <div key={player.id} className="slot" data-slot={player.id}>
          <span className="avatar" aria-hidden>
            {initials(player.name)}
          </span>
          <span className="who">{player.name}</span>
          <button type="button" className="x" aria-label={`Remove ${player.name}`} onClick={() => onRemove(player.id)}>
            ×
          </button>
        </div>
      ))}
      {Array.from({ length: empty }, (_, index) => (
        <div key={`${label}-empty-${index}`} className="slot empty">
          Add a player
        </div>
      ))}
    </section>
  );
}

function SetCard({
  index,
  set,
  shortA,
  shortB,
  onGames,
  onTiebreak,
}: {
  index: number;
  set: PadelSet;
  shortA: string;
  shortB: string;
  onGames: (index: number, side: PadelSide, delta: 1 | -1) => void;
  onTiebreak: (index: number, side: PadelSide, delta: 1 | -1) => void;
}) {
  const winner = setWinner(set);
  const tiebreak = tiebreakOpen(set);
  return (
    <section className="set" aria-labelledby={`padel-set-${index + 1}`} data-set-card={index}>
      <p className="set-label" id={`padel-set-${index + 1}`}>
        Set {index + 1}
      </p>
      <div className="games">
        <Stepper
          value={set.gamesA}
          caption={shortA}
          setIndex={index}
          side="A"
          kind="games"
          canDecrease={canStepGames(set, "A", -1)}
          canIncrease={canStepGames(set, "A", 1)}
          onDecrease={() => onGames(index, "A", -1)}
          onIncrease={() => onGames(index, "A", 1)}
        />
        <Stepper
          value={set.gamesB}
          caption={shortB}
          setIndex={index}
          side="B"
          kind="games"
          canDecrease={canStepGames(set, "B", -1)}
          canIncrease={canStepGames(set, "B", 1)}
          onDecrease={() => onGames(index, "B", -1)}
          onIncrease={() => onGames(index, "B", 1)}
        />
      </div>
      {tiebreak ? (
        <div className="tb" data-tiebreak="open">
          <p className="set-label">Tiebreak</p>
          <div className="games">
            <Stepper
              value={set.tiebreakA ?? 0}
              caption={shortA}
              setIndex={index}
              side="A"
              kind="tiebreak"
              canDecrease={canStepTiebreak(set, "A", -1)}
              canIncrease={canStepTiebreak(set, "A", 1)}
              onDecrease={() => onTiebreak(index, "A", -1)}
              onIncrease={() => onTiebreak(index, "A", 1)}
            />
            <Stepper
              value={set.tiebreakB ?? 0}
              caption={shortB}
              setIndex={index}
              side="B"
              kind="tiebreak"
              canDecrease={canStepTiebreak(set, "B", -1)}
              canIncrease={canStepTiebreak(set, "B", 1)}
              onDecrease={() => onTiebreak(index, "B", -1)}
              onIncrease={() => onTiebreak(index, "B", 1)}
            />
          </div>
        </div>
      ) : null}
      {winner ? (
        <p className="took">
          Set to Team {winner}
          {tiebreak ? ` · ${formatSetLine(set)}` : ""}
        </p>
      ) : null}
    </section>
  );
}
