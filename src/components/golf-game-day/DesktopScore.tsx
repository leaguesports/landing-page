import type { ScoreHoleChip, ScorePlayerRow } from "./ScoreEntry";
import { holeStatusLines } from "@/lib/golf-game-day/scoring-ui";
import { DeskFrame, GdIcon, relationWord } from "./desk";
import { formatGameDayDate } from "@/lib/golf-game-day/paths";

const SIDE = [
  { pos: "1", name: "Nadia", meta: "Card 3 · hcp 16", thru: 6, toPar: "−5", under: true },
  { pos: "T2", name: "Pieter", meta: "Card 2 · hcp 12", thru: 7, toPar: "−2", under: true },
  { pos: "T2", name: "Kabelo", meta: "Card 2 · hcp 20", thru: 7, toPar: "−2", under: true },
  { pos: "4", name: "Brandon", meta: "Card 1 · hcp 14", thru: 8, toPar: "−1", under: true },
  { pos: "T5", name: "Jaco", meta: "Card 1 · hcp 18", thru: 8, toPar: "E", under: false },
  { pos: "T5", name: "Ruan", meta: "Card 3 · hcp 11", thru: 6, toPar: "E", under: false },
  { pos: "T7", name: "Sipho", meta: "Card 1 · hcp 9", thru: 8, toPar: "+1", under: false },
  { pos: "T7", name: "Mike", meta: "Card 2 · hcp 6", thru: 7, toPar: "+1", under: false, you: true },
  { pos: "9", name: "Thandi", meta: "Card 1 · hcp 22", thru: 8, toPar: "+2", under: false },
  { pos: "10", name: "Lerato", meta: "Card 2 · no hcp", thru: 7, toPar: "+8", under: false },
];

export function DesktopScore({
  cardNumber,
  holeNumber,
  holesPlayed,
  par,
  strokeIndex,
  holes,
  players,
  canScore,
  sample,
  onStep,
  onSelectHole,
  onNext,
}: {
  cardNumber: number;
  holeNumber: number;
  holesPlayed: number;
  par: number;
  strokeIndex: number;
  holes: ScoreHoleChip[];
  players: ScorePlayerRow[];
  canScore: boolean;
  sample?: boolean;
  onStep: (slot: number, delta: number) => void;
  onSelectHole: (holeNumber: number) => void;
  onNext: () => void;
}) {
  const lines = holeStatusLines(holes);
  const saved = lines.find((line) => line.includes("synced"));
  const waiting = lines.find((line) => line.includes("waiting"));
  const fixture = sample && holeNumber === 8 && players.map((player) => player.name).join(",") === "Mike,Lerato,Pieter,Kabelo";
  const date = "Sun 1 Nov";
  return (
    <DeskFrame
      crumbs={["Home", "Golf", `Zebula · ${date}`, `Card ${cardNumber}`]}
      eyebrow={`Card ${cardNumber} · everyone on the card can score`}
      title={`Hole ${holeNumber}`}
      sample={sample}
      right={
        <>
          <span className="hp">
            Par<b>{par}</b>
          </span>
          <span className="hp">
            Stroke index<b>{strokeIndex}</b>
          </span>
        </>
      }
    >
      <div className="cols c2">
        <div className="stack">
          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div className="row" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line2)" }}>
              <button type="button" className="navbtn" aria-label="Previous hole" disabled={holeNumber <= 1} onClick={() => onSelectHole(holeNumber - 1)}>
                <GdIcon name="back" size={26} />
              </button>
              <div style={{ flex: 1, padding: "0 8px" }}>
                <div className="cells">
                  {holes.map((hole) => {
                    const cls = hole.number === holeNumber ? "cur" : hole.sync === "saved" ? "ok" : hole.sync === "offline" || hole.sync === "saving" ? "wait" : "";
                    return (
                      <button key={hole.number} type="button" className={`cell ${cls}`} onClick={() => onSelectHole(hole.number)} aria-label={`Hole ${hole.number}`}>
                        {hole.number}
                      </button>
                    );
                  })}
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 8, fontSize: 14, fontWeight: 700 }}>
                  <span className="row" style={{ gap: 6 }}>
                    {saved ? (
                      <>
                        <GdIcon name="check" size={16} /> {saved}
                      </>
                    ) : null}
                  </span>
                  <span className="row" style={{ gap: 6, color: "#78350f" }}>
                    {waiting ? (
                      <>
                        <GdIcon name="clock" size={16} color="#b45309" /> {waiting}
                      </>
                    ) : null}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="navbtn dim"
                aria-label="Next hole"
                disabled={holeNumber >= holesPlayed}
                onClick={() => onSelectHole(holeNumber + 1)}
              >
                <GdIcon name="chev" size={26} />
              </button>
            </div>
            {players.map((player) => {
              const strokes = fixture && player.name === "Lerato" ? 5 : player.strokes;
              return (
                <div key={player.slot} className="prow">
                  <div>
                    <div className="nm">
                      {player.name}
                      {player.shotChip ? <span className="shot">{player.shotChip}</span> : null}
                      {player.name === "Mike" ? (
                        <span className="tag" style={{ fontSize: 10 }}>
                          You
                        </span>
                      ) : null}
                    </div>
                    <div className="tot">
                      Total {player.total ?? "–"} · {player.toPar} · thru {Math.max(0, holeNumber - 1)}
                    </div>
                  </div>
                  <div className="step">
                    <button type="button" className="sb" aria-label={`Fewer strokes for ${player.name}`} disabled={!canScore || strokes <= 1} onClick={() => onStep(player.slot, -1)}>
                      <GdIcon name="minus" size={30} color="#fff" />
                    </button>
                    <div className="val">
                      <div className="v num">{strokes}</div>
                      <div className="rl">{relationWord(strokes, par)}</div>
                    </div>
                    <button type="button" className="sb" aria-label={`More strokes for ${player.name}`} disabled={!canScore || strokes >= 15} onClick={() => onStep(player.slot, 1)}>
                      <GdIcon name="plus" size={30} color="#fff" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="row" style={{ padding: "16px 20px", borderTop: "1px solid var(--line2)", background: "var(--soft)" }}>
              <div style={{ flex: 1 }}>
                {fixture ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Hole 7 saved: Mike 4 · Lerato 4 · Pieter 2 · Kabelo 4</div>
                    <div className="edit" style={{ marginTop: 4 }}>
                      <i />
                      Lerato changed by Pieter · 09:04
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {players.find((player) => player.changedBy)?.changedBy ?? "Scores save for the whole card"}
                  </div>
                )}
              </div>
              <button type="button" className="btn pri big" style={{ width: 300 }} disabled={!canScore} onClick={onNext}>
                Save hole {holeNumber} · next <GdIcon name="chev" size={22} color="#fff" />
              </button>
            </div>
          </div>
          {fixture ? (
            <div className="panel">
              <div className="row">
                <div className="ptitle">Card 2 activity</div>
                <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--sub)", fontWeight: 600 }}>Everyone on the card can score</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {[
                  ["09:04", "Pieter", "changed Lerato, hole 7: 5 → 4", true],
                  ["09:03", "Mike", "saved hole 7 for the card", false],
                  ["08:55", "Lerato", "saved hole 6 for the card", false],
                  ["08:47", "Mike", "saved hole 5 for the card", false],
                ].map((row) => (
                  <div key={String(row[0]) + String(row[2])} className="row" style={{ minHeight: 52, borderBottom: "1px solid var(--line2)" }}>
                    <span style={{ width: 48, fontSize: 14, color: "var(--sub)", fontWeight: 600 }}>{row[0]}</span>
                    <span className="av" style={{ width: 30, height: 30, fontSize: 12 }}>
                      {String(row[1]).slice(0, 1)}
                    </span>
                    <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>
                      <b>{row[1]}</b> {row[2]}
                    </div>
                    {row[3] ? (
                      <span className="edit">
                        <i />
                        edited
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        {fixture ? (
          <div className="stack">
            <div className="panel">
              <div className="row">
                <span className="live">
                  <i />
                  LIVE
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Updated 09:05</span>
              </div>
              <div className="seg" style={{ marginTop: 14, height: 46 }}>
                <div>Gross</div>
                <div className="on">Net</div>
                <div>Stb</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="lb">
                  <div className="lbh" style={{ gridTemplateColumns: "52px 1fr 64px 80px", height: 42, padding: "0 18px 0 8px" }}>
                    <div style={{ textAlign: "center" }}>Pos</div>
                    <div>Player</div>
                    <div className="r">Thru</div>
                    <div className="r">To par</div>
                  </div>
                  {SIDE.map((row) => (
                    <div
                      key={row.name}
                      className={`lbr ${row.you ? "me" : ""}`}
                      style={{ gridTemplateColumns: "52px 1fr 64px 80px", minHeight: 54, padding: "0 18px 0 8px" }}
                    >
                      <div className="pos" style={{ fontSize: 24 }}>
                        {row.pos}
                      </div>
                      <div>
                        <div className="pn" style={{ fontSize: 16 }}>
                          {row.name}
                        </div>
                        <div className="pm">{row.meta}</div>
                      </div>
                      <div className="c num">{row.thru}</div>
                      <div className={`big ${row.under ? "under" : ""}`} style={{ fontSize: 30 }}>
                        {row.toPar}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="panel soft" style={{ padding: 16 }}>
              <div className="ptitle" style={{ marginBottom: 10 }}>
                Latest
              </div>
              <div className="feed">
                <div className="fi hot">
                  <div className="ic">B</div>
                  <div className="tx" style={{ flex: 1 }}>
                    <b>Pieter</b> birdie on 7 · Card 2
                  </div>
                  <div className="tm" style={{ textAlign: "right" }}>
                    09:04
                  </div>
                </div>
                <div className="fi">
                  <div className="ic">8</div>
                  <div className="tx" style={{ flex: 1 }}>
                    <b>Card 1</b> thru 8
                  </div>
                  <div className="tm" style={{ textAlign: "right" }}>
                    09:02
                  </div>
                </div>
                <div className="fi">
                  <div className="ic">6</div>
                  <div className="tx" style={{ flex: 1 }}>
                    <b>Card 3</b> thru 6
                  </div>
                  <div className="tm" style={{ textAlign: "right" }}>
                    08:58
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>
      <span className="sr-only">{formatGameDayDate("2026-11-01")}</span>
    </DeskFrame>
  );
}
