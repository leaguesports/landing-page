import type { BoardTab, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import { formatGameDayDate, gameDayPlaceName, presentGameDay, whatsAppShareUrl } from "@/lib/golf-game-day/paths";
import {
  GAME_DAY_COURSE_PAR,
  formatHandicap,
  resultsTiebreakLine,
  resultsToParCell,
  resultsWinnerLine,
  signedScore,
} from "@/lib/golf-game-day/scoring-ui";
import { DeskFrame, GdIcon } from "./desk";

const TABS: BoardTab[] = ["gross", "net", "stableford"];

export function DesktopResults({
  board,
  tab,
  onTab,
  weekendHref,
  sample,
}: {
  board: GameDayLeaderboard;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  weekendHref: string | null;
  sample?: boolean;
}) {
  const shown = presentGameDay(board);
  const place = gameDayPlaceName(board.venueName);
  const date = formatGameDayDate(board.date);
  const rows = board.rankings[tab];
  const winner = rows[0] ?? null;
  const tiebreak = board.countbackApplied ? resultsTiebreakLine(rows, tab) : null;
  const line = winner
    ? resultsWinnerLine({
        tab,
        row: winner,
        coursePar: GAME_DAY_COURSE_PAR,
        countbackApplied: tiebreak != null && tab !== "stableford",
      })
    : "";
  const shareText = winner ? `${winner.displayName} won ${shown.headline}. ${line}` : shown.headline;
  const grid = "60px 1fr 110px 90px 90px 90px 90px";
  return (
    <DeskFrame
      crumbs={["Home", "Golf", `${place} · ${date}`, "Results"]}
      eyebrow="Final"
      title={`${place} · ${date}`}
      sample={sample}
      right={
        <span className="tag mint" style={{ fontSize: 12, padding: "6px 10px" }}>
          <GdIcon name="check" size={12} /> {board.cardsConfirmed}/{board.cardsTotal} cards confirmed
        </span>
      }
    >
      <div className="cols c2">
        <div className="stack">
          {winner ? (
            <div style={{ borderRadius: 16, background: "var(--nav)", color: "#fff", padding: "28px 32px", display: "flex", alignItems: "flex-end", gap: 24 }}>
              <div>
                <div className="row" style={{ gap: 8, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--mint)" }}>
                  <GdIcon name="trophy" size={20} color="#3dff8a" /> Winner · {tab === "stableford" ? "Stableford" : tab === "gross" ? "Gross" : "Net"}
                </div>
                <div className="bebas" style={{ fontSize: 88, lineHeight: 1, marginTop: 8 }}>
                  {winner.displayName}
                </div>
                <div style={{ fontSize: 18, marginTop: 2 }}>{line}</div>
                {tiebreak ? <div style={{ fontSize: 14, color: "#d4d4d8", marginTop: 6 }}>{tiebreak}</div> : null}
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 14, color: "#d4d4d8", lineHeight: 1.7 }}>
                Gross <b style={{ color: "#fff" }}>{winner.gross}</b>
                <br />
                Stableford <b style={{ color: "#fff" }}>{winner.stableford} pts</b>
                <br />
                Card {winner.cardNumber} · {formatHandicap(winner.handicapIndex) ?? "no hcp"}
              </div>
            </div>
          ) : null}
          <div className="row">
            <div className="seg" style={{ width: 420, height: 48 }} role="tablist" aria-label="Result">
              {TABS.map((item) => (
                <button key={item} type="button" className={item === tab ? "on" : ""} onClick={() => onTab(item)}>
                  {item === "stableford" ? "Stableford" : item === "gross" ? "Gross" : "Net"}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: "auto" }} className="note">
              <GdIcon name="flag" size={16} />
              <span>
                <b>Ties split on countback:</b> {board.countback ?? "last 9, 6, 3, 1"}
              </span>
            </div>
          </div>
          <div className="lb">
            <div className="lbh" style={{ gridTemplateColumns: grid, height: 42, padding: "0 20px 0 8px" }}>
              <div style={{ textAlign: "center" }}>Pos</div>
              <div>Player</div>
              <div>Card</div>
              <div className="r">To par</div>
              <div className="r">Net</div>
              <div className="r">Gross</div>
              <div className="r">Pts</div>
            </div>
            {rows.map((row) => (
              <ResultLine key={row.playerId} row={row} rows={rows} tab={tab} grid={grid} />
            ))}
          </div>
        </div>
        <div className="stack">
          <div className="panel">
            <div className="ptitle">Share</div>
            <a className="btn pri big" style={{ marginTop: 14 }} href={whatsAppShareUrl(shareText)}>
              <GdIcon name="bubble" size={24} color="#fff" /> Share results
            </a>
            <button
              type="button"
              className="btn out"
              style={{ marginTop: 10, height: 48, fontSize: 15 }}
              onClick={() => void navigator.clipboard?.writeText(shareText)}
            >
              <GdIcon name="copy" size={18} /> Copy results link
            </button>
          </div>
          <div className="panel">
            <div className="row" style={{ alignItems: "flex-start" }}>
              <GdIcon name="link" size={22} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Add to weekend event</div>
                <div style={{ fontSize: 14, color: "var(--body)", marginTop: 3, lineHeight: 1.45 }}>
                  Optional. Link with another day (e.g. Mon 2 Nov) for one combined board.
                </div>
              </div>
            </div>
            {weekendHref ? (
              <a href={weekendHref} className="pillbtn" style={{ marginTop: 14, width: "100%", height: 48 }}>
                <GdIcon name="plus" size={18} /> Add to weekend
              </a>
            ) : (
              <button type="button" className="pillbtn" style={{ marginTop: 14, width: "100%", height: 48 }} disabled>
                <GdIcon name="plus" size={18} /> Add to weekend
              </button>
            )}
          </div>
          <div className="panel soft">
            <div className="ptitle">Cards</div>
            {(sample
              ? [
                  ["Card 1", "Sipho", "12:58"],
                  ["Card 2", "Lerato", "13:06"],
                  ["Card 3", "Ruan", "13:11"],
                ]
              : board.cards.map((card) => [`Card ${card.number}`, "the group", ""])
            ).map((card) => (
              <div key={card[0]} className="row" style={{ minHeight: 58, borderBottom: "1px solid var(--line2)" }}>
                <span className="tag dark">{card[0]}</span>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                  <GdIcon name="lock" size={14} /> Confirmed by {card[1]}
                  {card[2] ? ` · ${card[2]}` : ""}
                </div>
              </div>
            ))}
            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <GdIcon name="key" size={18} />
              <span style={{ fontSize: 14, fontWeight: 800 }}>Organiser</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--body)", marginTop: 4 }}>Found a mistake? Reopen a card, fix it, and it confirms again.</div>
            <button type="button" className="unlock" style={{ marginTop: 12 }}>
              <GdIcon name="unlock" size={18} /> Organiser: Unlock card
            </button>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}

function ResultLine({
  row,
  rows,
  tab,
  grid,
}: {
  row: RankingRow;
  rows: RankingRow[];
  tab: BoardTab;
  grid: string;
}) {
  const cell = resultsToParCell(tab, row, GAME_DAY_COURSE_PAR);
  const metric = (item: RankingRow) => (tab === "net" ? item.net : tab === "gross" ? item.gross : item.stableford);
  const tied = rows.filter((item) => metric(item) === metric(row)).length > 1;
  const note = tied && row.countbackNote ? row.countbackNote : formatHandicap(row.handicapIndex) ?? "no hcp";
  return (
    <div className={`lbr ${row.you ? "me" : ""}`} style={{ gridTemplateColumns: grid, minHeight: 54, padding: "0 20px 0 8px" }}>
      <div className="pos" style={{ fontSize: 24 }}>
        {row.position}
      </div>
      <div>
        <span className="pn" style={{ fontSize: 17 }}>
          {row.displayName}
        </span>{" "}
        <span className="pm" style={{ marginLeft: 6 }}>
          {note}
        </span>
      </div>
      <div className="c" style={{ textAlign: "left" }}>
        Card {row.cardNumber}
      </div>
      <div className={`big ${cell.under ? "under" : ""}`} style={{ fontSize: 30 }}>
        {tab === "stableford" ? (row.stableford ?? "–") : cell.text || signedScore(row.toPar)}
      </div>
      <div className="c num" style={{ color: "var(--ink)", fontWeight: 800 }}>
        {row.net ?? "–"}
      </div>
      <div className="c num">{row.gross ?? "–"}</div>
      <div className="c num">{row.stableford ?? "–"}</div>
    </div>
  );
}
