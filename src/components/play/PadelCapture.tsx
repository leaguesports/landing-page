"use client";

import { trackActivation } from "@/lib/analytics/activation";
import { track } from "@/lib/analytics/track";
import {
  PADEL_CAPTURE_COPY,
  canAddPadelSet,
  canRemovePadelSet,
  emptyPadelCaptureDraft,
  padelCapturePayload,
  validatePadelCaptureDraft,
  type PadelCaptureDraft,
} from "@/lib/play/padel-capture";
import { scoreline } from "@/lib/play/padel-scoring";
import { recordSession } from "@/lib/sessions/record";
import { useState } from "react";

function setPlayer(
  draft: PadelCaptureDraft,
  side: "teamA" | "teamB",
  index: number,
  name: string,
): PadelCaptureDraft {
  const next = [...draft[side]] as PadelCaptureDraft["teamA"];
  next[index] = { name };
  return { ...draft, [side]: next };
}

function setGames(
  draft: PadelCaptureDraft,
  index: number,
  side: "a" | "b",
  value: number,
): PadelCaptureDraft {
  const games = Number.isFinite(value) ? Math.max(0, Math.min(7, value)) : 0;
  return {
    ...draft,
    sets: draft.sets.map((row, i) =>
      i === index ? { ...row, [side]: games } : row,
    ),
  };
}

export function PadelCapture({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<PadelCaptureDraft>(emptyPadelCaptureDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savedLine, setSavedLine] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issue = validatePadelCaptureDraft(draft);
    if (issue) {
      setError(issue.message);
      return;
    }
    const payload = padelCapturePayload(draft);
    if (!payload) {
      setError("Enter a finished scoreline for this format.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await recordSession({
      sport: "padel",
      config: payload.config,
      events: [payload.event],
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const line = scoreline(payload.event.data.sets);
    setSavedLine(line);
    track("game_lock", {
      sport: "padel",
      page_type: "scorecard",
      cta_slot: "inline",
    });
    trackActivation("padel_match_lock", { sport: "padel" });
  }

  if (savedLine) {
    return (
      <section className="padel-capture is-saved" aria-label="Match saved">
        <p className="hello">PADEL</p>
        <h1>{PADEL_CAPTURE_COPY.success}</h1>
        <p className="saved-line" role="status">
          {savedLine}
        </p>
        <p className="saved-hint">Locked to your recent matches.</p>
        <button type="button" className="cta" onClick={onSaved}>
          <span className="cta-copy">
            <b>{PADEL_CAPTURE_COPY.done}</b>
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="padel-capture" aria-label="Record a match">
      <button type="button" className="back" onClick={onCancel}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 6l-6 6 6 6" />
        </svg>
        {PADEL_CAPTURE_COPY.back}
      </button>

      <header className="capture-hero">
        <p className="hello">PADEL</p>
        <h1>{PADEL_CAPTURE_COPY.title}</h1>
        <p className="lede">{PADEL_CAPTURE_COPY.lede}</p>
        <div className="format-toggle" role="group" aria-label={PADEL_CAPTURE_COPY.formatLabel}>
          <span className="format-label">{PADEL_CAPTURE_COPY.formatLabel}</span>
          {(["best_of_3", "best_of_5"] as const).map((format) => (
            <button
              key={format}
              type="button"
              className={draft.format === format ? "format on" : "format"}
              aria-pressed={draft.format === format}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  format,
                  sets: current.sets.slice(0, format === "best_of_3" ? 3 : 5),
                }))
              }
            >
              {format === "best_of_3" ? "3" : "5"}
            </button>
          ))}
        </div>
      </header>

      <form className="capture-form" onSubmit={onSubmit}>
        <div className="sides">
          <div className="side">
            <p className="side-label">{PADEL_CAPTURE_COPY.teamA}</p>
            {draft.teamA.map((player, index) => (
              <input
                key={`a-${index}`}
                type="text"
                name={`teamA-${index}`}
                maxLength={40}
                placeholder={index === 0 ? "Name" : "Partner"}
                value={player.name}
                autoComplete="nickname"
                onChange={(event) =>
                  setDraft((current) => setPlayer(current, "teamA", index, event.target.value))
                }
              />
            ))}
          </div>
          <p className="versus" aria-hidden>
            VS
          </p>
          <div className="side">
            <p className="side-label">{PADEL_CAPTURE_COPY.teamB}</p>
            {draft.teamB.map((player, index) => (
              <input
                key={`b-${index}`}
                type="text"
                name={`teamB-${index}`}
                maxLength={40}
                placeholder={index === 0 ? "Name" : "Partner"}
                value={player.name}
                autoComplete="nickname"
                onChange={(event) =>
                  setDraft((current) => setPlayer(current, "teamB", index, event.target.value))
                }
              />
            ))}
          </div>
        </div>

        <div className="scoreboard">
          <div className="score-head">
            <p className="side-label">{PADEL_CAPTURE_COPY.setsLabel}</p>
            <div className="set-links">
              <button
                type="button"
                className="linkish"
                disabled={!canAddPadelSet(draft)}
                onClick={() =>
                  setDraft((current) =>
                    canAddPadelSet(current)
                      ? { ...current, sets: [...current.sets, { a: 0, b: 0 }] }
                      : current,
                  )
                }
              >
                {PADEL_CAPTURE_COPY.addSet}
              </button>
              <button
                type="button"
                className="linkish"
                disabled={!canRemovePadelSet(draft)}
                onClick={() =>
                  setDraft((current) =>
                    canRemovePadelSet(current)
                      ? { ...current, sets: current.sets.slice(0, -1) }
                      : current,
                  )
                }
              >
                {PADEL_CAPTURE_COPY.removeSet}
              </button>
            </div>
          </div>

          <div className="score-cols" aria-hidden>
            <span />
            <span>A</span>
            <span />
            <span>B</span>
          </div>

          <ol className="sets">
            {draft.sets.map((set, index) => (
              <li className="set-row" key={`set-${index}`}>
                <span className="set-n">{index + 1}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={7}
                  aria-label={`Set ${index + 1} team A`}
                  value={Number.isFinite(set.a) ? String(set.a) : "0"}
                  onChange={(event) =>
                    setDraft((current) =>
                      setGames(current, index, "a", Number(event.target.value.replace(/^0+(?=\d)/, ""))),
                    )
                  }
                />
                <span className="set-sep" aria-hidden>
                  –
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={7}
                  aria-label={`Set ${index + 1} team B`}
                  value={Number.isFinite(set.b) ? String(set.b) : "0"}
                  onChange={(event) =>
                    setDraft((current) =>
                      setGames(current, index, "b", Number(event.target.value.replace(/^0+(?=\d)/, ""))),
                    )
                  }
                />
              </li>
            ))}
          </ol>
        </div>

        {error ? (
          <p className="note" role="alert">
            <span className="dot" aria-hidden />
            {error}
          </p>
        ) : null}

        <button type="submit" className="cta" disabled={pending}>
          <span className="cta-copy">
            <b>{pending ? PADEL_CAPTURE_COPY.saving : PADEL_CAPTURE_COPY.submit}</b>
          </span>
        </button>
      </form>
    </section>
  );
}
