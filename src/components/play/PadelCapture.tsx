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
      <section className="padel-capture" aria-label="Match saved">
        <p className="hello">PADEL</p>
        <h1>{PADEL_CAPTURE_COPY.success}</h1>
        <p className="saved-line" role="status">
          {savedLine}
        </p>
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
        ← {PADEL_CAPTURE_COPY.back}
      </button>
      <p className="hello">PADEL</p>
      <h1>{PADEL_CAPTURE_COPY.title}</h1>

      <form className="capture-form" onSubmit={onSubmit}>
        <fieldset>
          <legend>{PADEL_CAPTURE_COPY.teamA}</legend>
          {draft.teamA.map((player, index) => (
            <input
              key={`a-${index}`}
              type="text"
              name={`teamA-${index}`}
              maxLength={40}
              placeholder={PADEL_CAPTURE_COPY.playerPlaceholder}
              value={player.name}
              autoComplete="nickname"
              onChange={(event) => {
                const name = event.target.value;
                setDraft((current) => {
                  const teamA = [...current.teamA] as PadelCaptureDraft["teamA"];
                  teamA[index] = { name };
                  return { ...current, teamA };
                });
              }}
            />
          ))}
        </fieldset>

        <fieldset>
          <legend>{PADEL_CAPTURE_COPY.teamB}</legend>
          {draft.teamB.map((player, index) => (
            <input
              key={`b-${index}`}
              type="text"
              name={`teamB-${index}`}
              maxLength={40}
              placeholder={PADEL_CAPTURE_COPY.playerPlaceholder}
              value={player.name}
              autoComplete="nickname"
              onChange={(event) => {
                const name = event.target.value;
                setDraft((current) => {
                  const teamB = [...current.teamB] as PadelCaptureDraft["teamB"];
                  teamB[index] = { name };
                  return { ...current, teamB };
                });
              }}
            />
          ))}
        </fieldset>

        <fieldset>
          <legend>{PADEL_CAPTURE_COPY.formatLabel}</legend>
          <div className="format-row" role="group" aria-label={PADEL_CAPTURE_COPY.formatLabel}>
            {(["best_of_3", "best_of_5"] as const).map((format) => (
              <button
                key={format}
                type="button"
                className={draft.format === format ? "chip on" : "chip"}
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
        </fieldset>

        <fieldset>
          <legend>{PADEL_CAPTURE_COPY.setsLabel}</legend>
          {draft.sets.map((set, index) => (
            <div className="set-row" key={`set-${index}`}>
              <span className="set-n">Set {index + 1}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={7}
                aria-label={`Set ${index + 1} team A`}
                value={set.a}
                onChange={(event) => {
                  const a = Number(event.target.value);
                  setDraft((current) => {
                    const sets = current.sets.map((row, i) =>
                      i === index ? { ...row, a: Number.isFinite(a) ? a : 0 } : row,
                    );
                    return { ...current, sets };
                  });
                }}
              />
              <span className="dash" aria-hidden>
                –
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={7}
                aria-label={`Set ${index + 1} team B`}
                value={set.b}
                onChange={(event) => {
                  const b = Number(event.target.value);
                  setDraft((current) => {
                    const sets = current.sets.map((row, i) =>
                      i === index ? { ...row, b: Number.isFinite(b) ? b : 0 } : row,
                    );
                    return { ...current, sets };
                  });
                }}
              />
            </div>
          ))}
          <div className="set-actions">
            <button
              type="button"
              className="sec"
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
              className="sec"
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
        </fieldset>

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
