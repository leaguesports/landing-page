"use client";

import { useEffect, useReducer, useRef } from "react";
import "./play-mode.css";
import { GolfHome } from "./GolfHome";
import { PadelHome } from "./PadelHome";
import { SocialHome } from "./SocialHome";
import {
  PLAY_MODE_COPY,
  PLAY_MODE_SESSION_LIVE,
  PLAY_MODES,
  initialModeSheet,
  modeSheetRows,
  nextFocusIndex,
  playModeFromSearch,
  playModeHref,
  playModeUrlDecision,
  readStoredPlayMode,
  reduceModeSheet,
  resolvePlayMode,
  writeStoredPlayMode,
  type PlayMode,
} from "@/lib/play/mode";

function Glyph({ mode, size }: { mode: PlayMode; size: number }) {
  const stroke = PLAY_MODE_COPY[mode].color;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (mode === "golf") {
    return (
      <svg {...common}>
        <path d="M7 21V3l10 4-10 4" />
        <ellipse cx="12" cy="21" rx="7" ry="1.5" />
      </svg>
    );
  }
  if (mode === "padel") {
    return (
      <svg {...common}>
        <ellipse cx="10" cy="9" rx="6" ry="6.5" />
        <path d="M14 14l5 6" />
        <circle cx="8" cy="8" r=".6" fill={stroke} />
        <circle cx="11" cy="7" r=".6" fill={stroke} />
        <circle cx="10" cy="11" r=".6" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M17 14.5c2.3 0 4 1.4 4.6 4" />
    </svg>
  );
}

function remember(mode: PlayMode) {
  writeStoredPlayMode(window.localStorage, mode);
  const href = playModeHref(mode);
  if (`${window.location.pathname}${window.location.search}` !== href) {
    window.history.replaceState(null, "", href);
  }
}

export function PlayModeApp({
  initialModeParam,
  initialFeedParam = null,
}: {
  initialModeParam: string | null;
  initialFeedParam?: string | null;
}) {
  const urlPresent = initialModeParam !== null;
  const [sheet, dispatch] = useReducer(
    reduceModeSheet,
    resolvePlayMode({ urlMode: initialModeParam, storedMode: null, urlPresent }),
    initialModeSheet,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const mode = sheet.mode;
  const copy = PLAY_MODE_COPY[mode];

  useEffect(() => {
    const url = playModeFromSearch(window.location.search);
    const stored = readStoredPlayMode(window.localStorage);
    const decision = playModeUrlDecision({
      urlMode: url.value,
      storedMode: stored,
      urlPresent: url.present,
    });
    dispatch({ type: "hydrate", mode: decision.mode });
    writeStoredPlayMode(window.localStorage, decision.mode);
    if (decision.href) window.history.replaceState(null, "", decision.href);
  }, [initialModeParam]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const pill = pillRef.current;
    if (!sheet.open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      pill?.focus();
    };
  }, [sheet.open]);

  useEffect(() => {
    if (!sheet.open) return;
    const id = PLAY_MODES[sheet.cursor];
    dialogRef.current?.querySelector<HTMLButtonElement>(`[data-mode="${id}"]`)?.focus();
  }, [sheet.open, sheet.cursor]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Tab") {
      const list = [
        ...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
      ];
      event.preventDefault();
      const index = list.indexOf(document.activeElement as HTMLButtonElement);
      list[nextFocusIndex(list.length, index, event.shiftKey)]?.focus();
      return;
    }
    const focused = (document.activeElement as HTMLElement | null)?.dataset.mode;
    if ((event.key === "Enter" || event.key === " ") && focused) {
      event.preventDefault();
      choose(focused);
      return;
    }
    if (
      event.key === "Escape" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      const next = reduceModeSheet(sheet, { type: "key", key: event.key });
      dispatch({ type: "key", key: event.key });
      if (next.mode !== sheet.mode) remember(next.mode);
    }
  }

  function choose(id: string) {
    const next = reduceModeSheet(sheet, { type: "select", id });
    if (next === sheet) return;
    dispatch({ type: "select", id });
    if (next.mode !== mode) remember(next.mode);
  }

  return (
    <div className="play-mode" data-session={PLAY_MODE_SESSION_LIVE ? "live" : "static"}>
      <div className="top">
        <button
          ref={pillRef}
          type="button"
          className="pill"
          aria-haspopup="dialog"
          aria-expanded={sheet.open}
          aria-controls="play-mode-sheet"
          onClick={() => dispatch({ type: "open" })}
        >
          <span className="ic" style={{ background: `${copy.color}1a` }}>
            <Glyph mode={mode} size={17} />
          </span>
          {copy.label}
          <span className="chev" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>
      <div className="content">
        {mode === "golf" ? (
          <GolfHome />
        ) : mode === "padel" ? (
          <PadelHome />
        ) : (
          <SocialHome initialFeed={initialFeedParam} />
        )}
      </div>
      {sheet.open ? (
        <dialog
          ref={dialogRef}
          id="play-mode-sheet"
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="play-mode-sheet-title"
          onKeyDown={onKeyDown}
          onCancel={(event) => {
            event.preventDefault();
            dispatch({ type: "close" });
          }}
          style={{ maxWidth: "100%", maxHeight: "100%", width: "100%", height: "100%", margin: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) dispatch({ type: "close" });
          }}
        >
          <div className="sheet-panel">
            <div className="grab" aria-hidden />
            <div className="sheet-head">
              <h2 id="play-mode-sheet-title">Switch mode</h2>
            </div>
            {modeSheetRows(mode).map((row) =>
            row.id === "add" ? (
              <div key={row.id}>
                <div className="rule" />
                <button type="button" className="mrow" disabled>
                  <span className="mi" style={{ background: "#f4f4f5" }} aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2.6" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span>
                    <span className="t">{row.label}</span>
                    <span className="s">{row.detail}</span>
                  </span>
                </button>
              </div>
            ) : (
              <button
                key={row.id}
                type="button"
                className={row.current ? "mrow cur" : "mrow"}
                data-mode={row.id}
                aria-current={row.current ? "true" : undefined}
                onClick={() => choose(row.id)}
              >
                <span className="mi" style={{ background: `${PLAY_MODE_COPY[row.id].color}1f` }}>
                  <Glyph mode={row.id} size={24} />
                </span>
                <span>
                  <span className="t">{row.label}</span>
                  <span className="s">{row.detail}</span>
                </span>
                {row.current ? (
                  <span className="tick">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006045" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                    Current
                  </span>
                ) : null}
              </button>
            ),
            )}
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
