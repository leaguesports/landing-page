import type { FormEvent } from "react";
import { formatGameDayDate } from "@/lib/golf-game-day/paths";
import { teeChipLabel } from "@/lib/golf-game-day/scoring-ui";
import { DeskFrame, desktopDateLong, GdIcon, teeFill } from "./desk";
import type { GameDayVenueChoice } from "./CreateGameDay";

const STEPS = [
  "Share the link or code ZB47 on WhatsApp",
  "Friends tap their name and pick a card (max 4)",
  "Anyone on a card enters scores, hole by hole",
  "One live board for all cards; confirm cards at the end",
];

export function DesktopCreate({
  venue,
  venues,
  date,
  dateLabel,
  tee,
  players,
  draftName,
  weekend,
  pending,
  error,
  sample,
  onVenue,
  onDate,
  onTee,
  onDraft,
  onAdd,
  onRemove,
  onWeekend,
  onSubmit,
}: {
  venue: GameDayVenueChoice | null;
  venues: GameDayVenueChoice[];
  date: string;
  dateLabel: string;
  tee: string;
  players: string[];
  draftName: string;
  weekend: boolean;
  pending: boolean;
  error: string | null;
  sample?: boolean;
  onVenue: (slug: string) => void;
  onDate: (value: string) => void;
  onTee: (value: string) => void;
  onDraft: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onWeekend: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const short = formatGameDayDate(date);
  const long = desktopDateLong(date) || dateLabel;
  const place = (venue?.name ?? "Game").split(/\s+/)[0] || "Game";
  return (
    <div className="gd-desk">
      <form onSubmit={onSubmit}>
        <DeskFrame
          crumbs={["Home", "Golf", "New game day"]}
          eyebrow="New game day · no account needed"
          title="Set up game day"
          sample={sample}
        >
          <div className="cols c2">
            <div className="panel" style={{ padding: 28 }}>
              <div className="sec">
                <div className="flab">Course</div>
                <div className="field sel" style={{ minHeight: 64 }}>
                  <GdIcon name="pin" size={20} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div>{venue?.name ?? "Choose a course"}</div>
                    <div className="s2">Bela-Bela · Limpopo · 18 holes · par 72 (example)</div>
                  </div>
                  <label className="end">
                    Change
                    <select
                      value={venue?.slug ?? ""}
                      onChange={(event) => onVenue(event.target.value)}
                      aria-label="Course"
                      style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
                    >
                      {venues.map((item) => (
                        <option key={item.id} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="sec fgrid">
                <div>
                  <div className="flab">Date</div>
                  <label className="field" style={{ position: "relative" }}>
                    <GdIcon name="cal" size={20} />
                    <div style={{ flex: 1 }}>{long}</div>
                    <span className="end">
                      <GdIcon name="chevd" size={18} />
                    </span>
                    <input
                      type="date"
                      value={date}
                      aria-label="Date"
                      onChange={(event) => onDate(event.target.value)}
                      style={{ position: "absolute", inset: 0, opacity: 0 }}
                    />
                  </label>
                </div>
                <div>
                  <div className="flab">
                    Tee <em>default for everyone</em>
                  </div>
                  <div className="chips">
                    {(venue?.tees ?? []).map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        className={item.name === tee ? "chip on" : "chip"}
                        style={{ flex: 1, height: 56 }}
                        aria-pressed={item.name === tee}
                        onClick={() => onTee(item.name)}
                      >
                        <span className="dot" style={{ background: teeFill(item.color || item.name) }} />
                        {teeChipLabel(item)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sec">
                <div className="flab">Format</div>
                <div className="fgrid">
                  <div className="opt on">
                    <div className="radio on" />
                    <div>
                      <div className="t">Stroke play</div>
                      <div className="s">Gross, net or Stableford on the board</div>
                    </div>
                  </div>
                  <div className="opt off">
                    <div className="radio" />
                    <div style={{ flex: 1 }}>
                      <div className="t">Scramble</div>
                      <div className="s">Team format</div>
                    </div>
                    <span className="tag">Coming later</span>
                  </div>
                </div>
              </div>
              <div className="sec">
                <div className="flab">
                  Players <em>optional · friends tap their name to join</em>
                </div>
                <div className="chips">
                  {players.map((name, index) => (
                    <span key={`${name}-${index}`} className="chip" style={{ height: 44, padding: "0 10px 0 16px" }}>
                      {name}
                      <button type="button" aria-label={`Remove ${name}`} onClick={() => onRemove(index)} style={{ color: "var(--sub)", display: "grid" }}>
                        <GdIcon name="x" size={16} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="field" style={{ marginTop: 12, paddingRight: 6, maxWidth: 520 }}>
                  <input
                    value={draftName}
                    onChange={(event) => onDraft(event.target.value)}
                    placeholder="Add a name"
                    aria-label="Player name"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onAdd();
                      }
                    }}
                  />
                  <button type="button" className="pillbtn dark" style={{ marginLeft: "auto" }} onClick={onAdd}>
                    <GdIcon name="plus" size={18} color="#fff" /> Add
                  </button>
                </div>
              </div>
              <div className="sec">
                <div className="row" style={{ minHeight: 56 }}>
                  <GdIcon name="link" size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Add to weekend event</div>
                    <div style={{ fontSize: 14, color: "var(--sub)", marginTop: 2 }}>Optional. Combine leaderboards across days.</div>
                  </div>
                  <button
                    type="button"
                    className={weekend ? "toggle on" : "toggle"}
                    role="switch"
                    aria-checked={weekend}
                    aria-label="Add to weekend event"
                    onClick={onWeekend}
                  />
                </div>
              </div>
              {error ? (
                <p role="alert" className="hint" style={{ color: "#b91c1c" }}>
                  {error}
                </p>
              ) : null}
            </div>
            <div className="stack">
              <div className="panel">
                <div className="ptitle">Preview</div>
                <h3 style={{ fontSize: 36, marginTop: 8 }}>
                  {place} · {short}
                </h3>
                <div style={{ marginTop: 12 }}>
                  <div className="kv"><span>Course</span><b>{venue?.name ?? "—"}</b></div>
                  <div className="kv"><span>Date</span><b>{long}</b></div>
                  <div className="kv"><span>Tee</span><b>{tee || "—"}</b></div>
                  <div className="kv"><span>Format</span><b>Stroke play</b></div>
                  <div className="kv"><span>Players added</span><b>{players.length} · up to 4 per card</b></div>
                  <div className="kv"><span>Scoring</span><b>Everyone on a card</b></div>
                </div>
                <button type="submit" className="btn pri" style={{ marginTop: 20 }} disabled={pending || !venue}>
                  {pending ? "Creating…" : "Create game day"}
                </button>
              </div>
              <div className="panel soft">
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <GdIcon name="key" size={22} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>No login needed</div>
                    <div style={{ fontSize: 14, color: "var(--body)", marginTop: 4, lineHeight: 1.45 }}>
                      After you create it you get a private organiser link. That link is how you manage the game day.
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="ptitle">How the day works</div>
                {STEPS.map((step, index) => (
                  <div key={step} className="row" style={{ minHeight: 54, borderBottom: "1px solid var(--line2)", alignItems: "center" }}>
                    <span className="step-n">{index + 1}</span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DeskFrame>
      </form>
    </div>
  );
}
