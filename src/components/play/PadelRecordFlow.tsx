"use client";

/**
 * MOCK Record a match. Steps stay on /play. No network.
 */

import { padelMockVenue } from "@/lib/play/mock/padel-mock-data";
import {
  PADEL_MOCK_SHARE_TOAST,
  buildSavedMatch,
  summaryFromDraft,
  summaryFromMatch,
  type PadelSummary,
  type SavedPadelMatch,
} from "@/lib/play/mock/padel-match-store";
import {
  addGuestToSlot,
  addUnnamedToSlot,
  clearSlot,
  fillSlot,
  initialPadelDraft,
  matchingPlayers,
  matchingVenues,
  unnamedOnCourt,
  readSlot,
  resolvePadelPlayer,
  setDraftFormat,
  setDraftVenue,
  shortPlayerList,
  slotOfPlayer,
  slotsForSide,
  teamsReady,
  type PadelDraft,
  type PadelFormat,
  type PadelSlotId,
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
  setsForEntry,
  tiebreakOpen,
  type PadelSet,
  type PadelSide,
} from "@/lib/play/mock/padel-score";
import { useEffect, useRef, useState, type ReactNode } from "react";

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

function namedSide(draft: PadelDraft, side: "A" | "B") {
  return slotsForSide(draft.format, side).flatMap((slot) => {
    const id = readSlot(draft, slot);
    const player = id ? resolvePadelPlayer(draft, id) : null;
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
  const [sheet, setSheet] = useState<{ kind: "player"; slot: PadelSlotId } | { kind: "venue" } | null>(null);
  const [query, setQuery] = useState("");
  const [guestName, setGuestName] = useState("");
  const openerRef = useRef<HTMLElement | null>(null);

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

  const teamA = namedSide(draft, "A");
  const teamB = namedSide(draft, "B");
  const shortA = teamA.length ? shortPlayerList(teamA) : "Team A";
  const shortB = teamB.length ? shortPlayerList(teamB) : "Team B";
  const ready = teamsReady(draft);
  const winner = matchWinner(draft.sets);
  const review = step === "review" && playedOn ? summaryFromDraft(draft, playedOn) : null;
  const done = saved ? summaryFromMatch(saved) : null;
  const title = step === "done" ? (done ? `${done.winner} won` : "Saved") : STEP_TITLE[step];
  const openSets = setsForEntry(draft.sets);
  const venue = draft.venueId ? padelMockVenue(draft.venueId) : null;

  function openPlayer(slot: PadelSlotId, opener: HTMLElement) {
    openerRef.current = opener;
    setQuery("");
    setGuestName("");
    setSheet({ kind: "player", slot });
  }

  function openVenue(opener: HTMLElement) {
    openerRef.current = opener;
    setQuery("");
    setGuestName("");
    setSheet({ kind: "venue" });
  }

  function closeSheet() {
    const opener = openerRef.current;
    setSheet(null);
    setQuery("");
    setGuestName("");
    requestAnimationFrame(() => opener?.focus());
  }

  function pickPlayer(playerId: string) {
    if (sheet?.kind !== "player") return;
    const slot = sheet.slot;
    setDraft((current) => fillSlot(current, slot, playerId));
    closeSheet();
  }

  function confirmGuest() {
    if (sheet?.kind !== "player" || !guestName.trim()) return;
    const slot = sheet.slot;
    const name = guestName;
    setDraft((current) => addGuestToSlot(current, slot, name));
    closeSheet();
  }

  function addUnnamed() {
    if (sheet?.kind !== "player") return;
    const slot = sheet.slot;
    setDraft((current) => addUnnamedToSlot(current, slot));
    closeSheet();
  }

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
          <div className="court">
            <CourtSide
              label="Team A"
              slots={slotsForSide(draft.format, "A")}
              draft={draft}
              onOpen={openPlayer}
              onClear={(slot) => setDraft((current) => clearSlot(current, slot))}
            />
            <CourtSide
              label="Team B"
              slots={slotsForSide(draft.format, "B")}
              draft={draft}
              onOpen={openPlayer}
              onClear={(slot) => setDraft((current) => clearSlot(current, slot))}
            />
          </div>
          <VenueRow
            name={venue?.name ?? null}
            onOpen={openVenue}
            onClear={() => setDraft((current) => setDraftVenue(current, null))}
          />
          <button type="button" className="cta" disabled={!ready} onClick={() => setStep("score")}>
            Continue
          </button>
          {sheet?.kind === "player" ? (
            <PlayerSheet
              slot={sheet.slot}
              draft={draft}
              query={query}
              guestName={guestName}
              onQuery={setQuery}
              onGuestName={setGuestName}
              onPick={pickPlayer}
              onGuest={confirmGuest}
              onUnnamed={addUnnamed}
              onClose={closeSheet}
            />
          ) : null}
          {sheet?.kind === "venue" ? (
            <VenueSheet
              query={query}
              selectedId={draft.venueId}
              onQuery={setQuery}
              onPick={(id) => {
                setDraft((current) => setDraftVenue(current, id));
                closeSheet();
              }}
              onSkip={() => {
                setDraft((current) => setDraftVenue(current, null));
                closeSheet();
              }}
              onClose={closeSheet}
            />
          ) : null}
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

function CourtSide({
  label,
  slots,
  draft,
  onOpen,
  onClear,
}: {
  label: string;
  slots: readonly PadelSlotId[];
  draft: PadelDraft;
  onOpen: (slot: PadelSlotId, opener: HTMLElement) => void;
  onClear: (slot: PadelSlotId) => void;
}) {
  return (
    <section className="court-side" aria-label={label}>
      <p className="lbl">{label}</p>
      {slots.map((slot) => {
        const id = readSlot(draft, slot);
        const player = id ? resolvePadelPlayer(draft, id) : null;
        if (!player) {
          return (
            <button
              key={slot}
              type="button"
              className="slot empty"
              data-slot={slot}
              aria-label={`${slot}, empty`}
              onClick={(event) => onOpen(slot, event.currentTarget)}
            >
              <span className="slot-code">{slot}</span>
              <span className="who">Tap to add</span>
            </button>
          );
        }
        return (
          <div key={slot} className="slot" data-slot={slot} data-player={player.id}>
            <button
              type="button"
              className="slot-hit"
              aria-label={`${slot}, ${player.name}`}
              onClick={(event) => onOpen(slot, event.currentTarget)}
            >
              <span className="avatar" aria-hidden>
                {initials(player.name)}
              </span>
              <span className="slot-copy">
                <span className="slot-code">{slot}</span>
                <span className="who">{player.name}</span>
              </span>
            </button>
            <button
              type="button"
              className="x"
              aria-label={`Clear ${player.name}`}
              onClick={() => onClear(slot)}
            >
              ×
            </button>
          </div>
        );
      })}
    </section>
  );
}

function VenueRow({
  name,
  onOpen,
  onClear,
}: {
  name: string | null;
  onOpen: (opener: HTMLElement) => void;
  onClear: () => void;
}) {
  if (!name) {
    return (
      <button type="button" className="venue-row" data-venue-row="empty" onClick={(event) => onOpen(event.currentTarget)}>
        <span className="slot-copy">
          <span className="slot-code">Where did you play?</span>
          <span className="who">Optional</span>
        </span>
      </button>
    );
  }
  return (
    <div className="venue-row" data-venue-row={name}>
      <button type="button" className="slot-hit" onClick={(event) => onOpen(event.currentTarget)}>
        <span className="slot-copy">
          <span className="slot-code">Where did you play?</span>
          <span className="who">{name}</span>
        </span>
      </button>
      <button type="button" className="x" aria-label={`Clear ${name}`} onClick={onClear}>
        ×
      </button>
    </div>
  );
}

function BottomSheet({
  titleId,
  title,
  sheet,
  onClose,
  children,
}: {
  titleId: string;
  title: string;
  sheet: "player" | "venue";
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-sheet-search]")?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="sheet padel-sheet"
      data-sheet={sheet}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ maxWidth: "100%", maxHeight: "100%", width: "100%", height: "100%", margin: 0 }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-panel">
        <div className="grab" aria-hidden />
        <div className="sheet-head">
          <h2 id={titleId}>{title}</h2>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function PlayerSheet({
  slot,
  draft,
  query,
  guestName,
  onQuery,
  onGuestName,
  onPick,
  onGuest,
  onUnnamed,
  onClose,
}: {
  slot: PadelSlotId;
  draft: PadelDraft;
  query: string;
  guestName: string;
  onQuery: (value: string) => void;
  onGuestName: (value: string) => void;
  onPick: (playerId: string) => void;
  onGuest: () => void;
  onUnnamed: () => void;
  onClose: () => void;
}) {
  const players = [...unnamedOnCourt(draft, query), ...matchingPlayers(query)];
  return (
    <BottomSheet titleId="padel-player-sheet-title" title={`Choose ${slot}`} sheet="player" onClose={onClose}>
      <button type="button" className="prow unnamed" data-unnamed="" onClick={onUnnamed}>
        <span className="avatar" aria-hidden>
          {initials("Unnamed player")}
        </span>
        <span className="who">Unnamed player</span>
      </button>
      <label className="sheet-search">
        <span className="sheet-search-label">Search</span>
        <input
          data-sheet-search=""
          type="search"
          placeholder="Search players"
          value={query}
          autoComplete="off"
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <div className="sheet-scroll">
        {players.length === 0 ? (
          <p className="hint">No players match.</p>
        ) : (
          <ul className="sheet-list">
            {players.map((player) => {
              const seated = slotOfPlayer(draft, player.id);
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    className={seated === slot ? "prow cur" : "prow"}
                    data-player={player.id}
                    aria-current={seated === slot ? "true" : undefined}
                    onClick={() => onPick(player.id)}
                  >
                    <span className="avatar" aria-hidden>
                      {initials(player.name)}
                    </span>
                    <span className="slot-copy">
                      <span className="who">{player.name}</span>
                      {seated ? (
                        <span className="seat-note">{seated === slot ? "In this slot" : seated}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="rule" />
      <form
        className="guest-row"
        onSubmit={(event) => {
          event.preventDefault();
          onGuest();
        }}
      >
        <p className="lbl">Add guest by name</p>
        <input
          value={guestName}
          placeholder="Name"
          aria-label="Guest name"
          autoComplete="off"
          onChange={(event) => onGuestName(event.target.value)}
        />
        <button type="submit" className="cta" disabled={!guestName.trim()}>
          Add guest
        </button>
      </form>
    </BottomSheet>
  );
}

function VenueSheet({
  query,
  selectedId,
  onQuery,
  onPick,
  onSkip,
  onClose,
}: {
  query: string;
  selectedId: string | null;
  onQuery: (value: string) => void;
  onPick: (venueId: string) => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const venues = matchingVenues(query);
  return (
    <BottomSheet titleId="padel-venue-sheet-title" title="Where did you play?" sheet="venue" onClose={onClose}>
      <label className="sheet-search">
        <span className="sheet-search-label">Search</span>
        <input
          data-sheet-search=""
          type="search"
          placeholder="Search venues"
          value={query}
          autoComplete="off"
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <div className="sheet-scroll">
        {venues.length === 0 ? (
          <p className="hint">No venues match.</p>
        ) : (
          <ul className="sheet-list">
            {venues.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={selectedId === item.id ? "prow cur" : "prow"}
                  data-venue={item.id}
                  aria-pressed={selectedId === item.id}
                  onClick={() => onPick(item.id)}
                >
                  <span className="who">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="sec" onClick={onSkip}>
        Skip
      </button>
    </BottomSheet>
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
