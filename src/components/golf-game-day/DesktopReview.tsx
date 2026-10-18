import Link from "next/link";
import { scoreMark } from "@/lib/golf-game-day/scoring-ui";
import { DeskFrame, GdIcon } from "./desk";
import type { ReviewPlayer } from "./CardReview";

const FRONT = [4, 4, 3, 5, 4, 4, 3, 4, 5];
const BACK = [4, 3, 5, 4, 4, 4, 3, 5, 4];

function sum(values: Array<number | null>, start: number, end: number): number | null {
  let total = 0;
  for (let index = start; index < end; index += 1) {
    const value = values[index];
    if (value == null) return null;
    total += value;
  }
  return total;
}

export function DesktopReview({
  cardNumber,
  players,
  canConfirm,
  confirming,
  canUnlock,
  unlocking,
  sample,
  scoreHref,
  onConfirm,
  onUnlock,
  onEditHole,
  onLooksRight,
}: {
  cardNumber: number;
  players: ReviewPlayer[];
  canConfirm: boolean;
  confirming: boolean;
  canUnlock?: boolean;
  unlocking?: boolean;
  sample?: boolean;
  scoreHref: string;
  onConfirm: () => void;
  onUnlock?: () => void;
  onEditHole?: (holeNumber: number) => void;
  onLooksRight?: (slot: number) => void;
}) {
  const pars = [...FRONT, ...BACK];
  const fixture = sample && players.map((player) => player.name).join(",") === "Mike,Lerato,Pieter,Kabelo";
  return (
    <DeskFrame
      crumbs={["Home", "Golf", "Zebula · Sun 1 Nov", `Card ${cardNumber}`]}
      eyebrow={`Card ${cardNumber} · all 18 holes in`}
      title="Check your card"
      sample={sample}
      right={
        <Link href={scoreHref} className="pillbtn">
          <GdIcon name="back" size={18} /> Back to hole 18
        </Link>
      }
    >
      <div className="cols c2w">
        <div className="stack">
          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <table className="grid">
              <colgroup>
                <col style={{ width: 96 }} />
                {Array.from({ length: 9 }, (_, index) => (
                  <col key={`f${index}`} />
                ))}
                <col style={{ width: 44 }} />
                {Array.from({ length: 9 }, (_, index) => (
                  <col key={`b${index}`} />
                ))}
                <col style={{ width: 44 }} />
                <col style={{ width: 50 }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingLeft: 14 }}>Hole</th>
                  {Array.from({ length: 9 }, (_, index) => (
                    <th key={index + 1}>{index + 1}</th>
                  ))}
                  <th className="tt">Out</th>
                  {Array.from({ length: 9 }, (_, index) => (
                    <th key={index + 10}>{index + 10}</th>
                  ))}
                  <th className="tt">In</th>
                  <th className="tot">Tot</th>
                </tr>
                <tr className="par">
                  <td className="n" style={{ color: "var(--sub)" }}>
                    Par
                  </td>
                  {FRONT.map((value, index) => (
                    <td key={`pf${index}`}>{players[0]?.holes[index]?.par ?? value}</td>
                  ))}
                  <td className="tt">36</td>
                  {BACK.map((value, index) => (
                    <td key={`pb${index}`}>{players[0]?.holes[index + 9]?.par ?? value}</td>
                  ))}
                  <td className="tt">36</td>
                  <td className="tt">72</td>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const strokes = player.holes.map((hole) => hole.strokes);
                  const out = sum(strokes, 0, 9);
                  const inn = sum(strokes, 9, 18);
                  const total = out != null && inn != null ? out + inn : player.gross;
                  return (
                    <tr key={player.slot}>
                      <td className="n">{player.name}</td>
                      {player.holes.slice(0, 9).map((hole, index) => (
                        <ScoreTd key={hole.number} hole={hole} par={hole.par ?? pars[index]} edited={fixture && player.name === "Kabelo" && hole.number === 11} onEdit={onEditHole} />
                      ))}
                      <td className="tt">{out ?? "–"}</td>
                      {player.holes.slice(9, 18).map((hole, index) => (
                        <ScoreTd key={hole.number} hole={hole} par={hole.par ?? pars[index + 9]} edited={fixture && player.name === "Kabelo" && hole.number === 11} onEdit={onEditHole} />
                      ))}
                      <td className="tt">{inn ?? "–"}</td>
                      <td className="tot">{total ?? "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="row" style={{ padding: "14px 18px", gap: 20, fontSize: 13, color: "var(--sub)", fontWeight: 600, flexWrap: "wrap" }}>
              <span className="row" style={{ gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--ink)" }} />
                Birdie or better
              </span>
              <span className="row" style={{ gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: "var(--soft)", border: "1px solid var(--line)" }} />
                Double bogey+
              </span>
              <span className="row" style={{ gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ink)" }} />
                Changed after entry
              </span>
              <span style={{ marginLeft: "auto", color: "var(--text)" }}>Tap any score to fix it.</span>
            </div>
          </div>
          {fixture ? (
            <div className="callout" style={{ maxWidth: 560 }}>
              <GdIcon name="edit" size={18} />
              <span>
                Hole 11 · Kabelo <b>3</b> (was 4): <span className="edit" style={{ fontSize: 14 }}>changed by Mike · 10:41</span>
              </span>
            </div>
          ) : null}
          <div className="panel" style={{ padding: "8px 24px" }}>
            {players.map((player) => {
              const on = player.looksRight === true;
              const summary =
                player.gross == null
                  ? "Score incomplete"
                  : `${player.gross} gross · ${player.net == null ? "no hcp" : `${player.net} net`} · ${player.points ?? "–"} pts`;
              return (
                <div key={player.slot} className="row" style={{ minHeight: 68, borderBottom: "1px solid var(--line2)" }}>
                  <span className="av">{player.name.slice(0, 1)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{player.name}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", width: 330 }}>{summary}</div>
                  <button
                    type="button"
                    className={on ? "lr on" : "lr"}
                    style={{ width: 150 }}
                    onClick={() => onLooksRight?.(player.slot)}
                  >
                    <GdIcon name="check" size={16} /> {on ? "Looks right" : "Looks right?"}
                  </button>
                </div>
              );
            })}
            <div className="hint" style={{ padding: "10px 0 12px" }}>
              &quot;Looks right&quot; ticks are optional.
            </div>
          </div>
        </div>
        <div className="stack">
          <div className="panel" style={{ border: "2px solid var(--ink)" }}>
            <div className="ptitle">Confirm Card {cardNumber}</div>
            <div style={{ fontSize: 15, color: "var(--body)", marginTop: 8, lineHeight: 1.45, fontWeight: 500 }}>
              <b style={{ color: "var(--ink)" }}>Anyone on the card can confirm.</b> Once confirmed, scores lock for everyone.
            </div>
            <div className="row" style={{ gap: 6, marginTop: 14 }}>
              {players.map((player) => (
                <span key={player.slot} className="av" style={{ width: 40, height: 40 }}>
                  {player.name.slice(0, 1)}
                </span>
              ))}
              <span style={{ fontSize: 13, color: "var(--sub)", marginLeft: 6, fontWeight: 600 }}>
                {players.map((player) => player.name).join(", ").replace(/, ([^,]+)$/, " or $1")}
              </span>
            </div>
            <button type="button" className="btn pri big" style={{ marginTop: 18 }} disabled={!canConfirm || confirming} onClick={onConfirm}>
              <GdIcon name="check" size={22} color="#fff" /> {confirming ? "Confirming…" : `Confirm Card ${cardNumber}`}
            </button>
          </div>
          <div className="panel">
            <div className="ptitle">All cards</div>
            {(fixture
              ? [
                  ["Card 1", "lock", "Confirmed by Sipho · 12:58"],
                  ["Card 2", "", "Reviewing now"],
                  ["Card 3", "", "Playing 18"],
                ]
              : [[`Card ${cardNumber}`, "", confirming ? "Confirming…" : "Reviewing now"]]
            ).map((row, index, rows) => (
              <div key={row[0]} className="row" style={{ minHeight: 62, borderBottom: index === rows.length - 1 ? 0 : "1px solid var(--line2)" }}>
                <span className="tag dark">{row[0]}</span>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: row[2] === "Playing 18" ? "var(--sub)" : undefined }}>
                  {row[1] === "lock" ? <GdIcon name="lock" size={14} /> : null} {row[2]}
                </div>
              </div>
            ))}
          </div>
          <div className="panel soft">
            <div className="row" style={{ gap: 8 }}>
              <GdIcon name="key" size={18} />
              <span style={{ fontSize: 14, fontWeight: 800 }}>Organiser</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--body)", marginTop: 6, lineHeight: 1.45 }}>
              Opened with the organiser link, you can reopen a confirmed card to fix it.
            </div>
            <button type="button" className="unlock" style={{ marginTop: 12 }} disabled={unlocking} onClick={onUnlock}>
              <GdIcon name="unlock" size={18} /> {unlocking ? "Unlocking…" : "Organiser: Unlock Card 1"}
            </button>
            {canUnlock ? null : null}
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}

function ScoreTd({
  hole,
  par,
  edited,
  onEdit,
}: {
  hole: ReviewPlayer["holes"][number];
  par: number;
  edited?: boolean;
  onEdit?: (holeNumber: number) => void;
}) {
  const strokes = hole.strokes;
  const mark = strokes == null ? "plain" : scoreMark(strokes, par);
  const inner =
    strokes == null ? (
      "–"
    ) : mark === "birdie" ? (
      <span className="bd">{strokes}</span>
    ) : mark === "double" ? (
      <span className="bo">{strokes}</span>
    ) : (
      strokes
    );
  return (
    <td>
      {onEdit ? (
        <button type="button" onClick={() => onEdit(hole.number)} aria-label={`Edit hole ${hole.number}`} style={{ font: "inherit", color: "inherit" }}>
          {inner}
        </button>
      ) : (
        inner
      )}
      {edited ? <span className="ed" /> : null}
    </td>
  );
}
