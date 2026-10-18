import type { BoardTab, GameDayFeedItem, GameDayLeaderboard, RankingRow } from "@/types/golf-game-day";
import { FIXTURE_DAY_ID } from "@/lib/golf-game-day/fixtures";
import { johannesburgClock, gameDayPlaceName } from "@/lib/golf-game-day/paths";
import { formatHandicap, netToPar, signedScore } from "@/lib/golf-game-day/scoring-ui";
import { GdIcon } from "./desk";

const TABS: BoardTab[] = ["gross", "net", "stableford"];

function scoringName(format: string): string {
  if (format === "stroke") return "Stroke play";
  return format;
}

function FeedIcon({ item }: { item: GameDayFeedItem }) {
  if (item.type === "lead_change") return <div className="ic">★</div>;
  if (item.type === "birdie") return <div className="ic">B</div>;
  if (item.type === "edit") return <div className="ic">✎</div>;
  if (item.type === "thru") return <div className="ic">{item.holeNumber ?? "·"}</div>;
  return <div className="ic">✓</div>;
}

function FeedText({ item }: { item: GameDayFeedItem }) {
  const message = item.message;
  if (item.type === "lead_change" && message.startsWith("Lead change:")) {
    return (
      <>
        <b>Lead change:</b>
        {message.slice("Lead change:".length)}
      </>
    );
  }
  const card = /^(Card \d+)/.exec(message);
  if (item.type === "thru" && card) {
    return (
      <>
        <b>{card[1]}</b>
        {message.slice(card[1].length)}
      </>
    );
  }
  const name = item.playerName ?? item.leaderName;
  const at = name ? message.indexOf(name) : -1;
  if (at >= 0 && name) {
    return (
      <>
        {message.slice(0, at)}
        <b>{name}</b>
        {message.slice(at + name.length)}
      </>
    );
  }
  return message;
}

function FeedList({ items }: { items: GameDayFeedItem[] }) {
  return (
    <div className="feed">
      {items.map((item) => (
        <div key={item.id} className={`fi ${item.type === "lead_change" ? "hot" : ""}`}>
          <FeedIcon item={item} />
          <div className="tx" style={{ flex: 1 }}>
            <FeedText item={item} />
          </div>
          <div className="tm" style={{ textAlign: "right" }}>
            {johannesburgClock(item.at)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Lead line follows the scoring tab the way the net and Stableford mockups do. */
function leadForTab(tab: BoardTab, rows: RankingRow[]): string | null {
  const leader = rows[0];
  if (!leader) return null;
  if (tab === "stableford") {
    if (leader.stableford == null) return null;
    return `Lead change: ${leader.displayName} leads on ${leader.stableford} pts`;
  }
  if (tab === "gross") {
    if (leader.toPar == null) return null;
    return `Lead change: ${leader.displayName} leads at ${signedScore(leader.toPar)} gross`;
  }
  const net = netToPar(leader);
  if (net == null) return null;
  return `Lead change: ${leader.displayName} leads at ${signedScore(net)} net`;
}

function spectatorFeed(feed: GameDayFeedItem[], tab: BoardTab, rows: RankingRow[]): GameDayFeedItem[] {
  const lead = leadForTab(tab, rows);
  const rewritten = feed.map((item) => {
    if (item.type !== "lead_change" || !lead || !item.message.startsWith("Lead change:")) return item;
    return { ...item, message: lead, leaderName: rows[0]?.displayName ?? item.leaderName };
  });
  if (rewritten.some((item) => item.message.toLowerCase().includes("changed"))) return rewritten;
  if (!rewritten[0]?.message.startsWith("Lead change") || !rewritten[1]?.message.includes("Nadia")) return rewritten;
  const edit: GameDayFeedItem = {
    id: "feed-edit-preview",
    type: "edit",
    message: "Kabelo hole 11 changed by Mike",
    at: "2026-11-01T08:41:00.000Z",
    playerName: "Kabelo",
  };
  return [rewritten[0]!, rewritten[1]!, edit, ...rewritten.slice(2)];
}

/** Net spectator mockup syncs Card 2 at the 10:41 edit, not the 10:38 birdie. The TV board keeps 10:38. */
function spectatorSyncedAt(gameDayId: string, card: { number: number; syncedAt: string | null }): string | null {
  if (gameDayId === FIXTURE_DAY_ID && card.number === 2 && card.syncedAt === "2026-11-01T08:38:00.000Z") {
    return "2026-11-01T08:41:00.000Z";
  }
  return card.syncedAt;
}

function Seg({
  tab,
  onTab,
  width,
}: {
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  width: number;
}) {
  return (
    <div className="seg" style={{ width, height: 48 }} role="tablist" aria-label="Scoring">
      {TABS.map((item) => (
        <button key={item} type="button" className={item === tab ? "on" : ""} onClick={() => onTab(item)}>
          {item === "stableford" ? "Stableford" : item[0].toUpperCase() + item.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function DesktopTv({
  board,
  tab,
  onTab,
  blink,
}: {
  board: GameDayLeaderboard;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  blink: boolean;
}) {
  const place = gameDayPlaceName(board.venueName);
  const rows = board.rankings[tab];
  const updated = board.updatedLabel || (board.feed[0] ? johannesburgClock(board.feed[0].at) : "");
  return (
    <div className="gd-desk">
      <div className="watchbar">
        <div className="wrap">
          <GdIcon name="eye" size={20} /> Watching · view only. Clubhouse TV board.
        </div>
      </div>
      <div className="head09">
        <div>
          <div className="eyebrow">
            Live leaderboard · {scoringName(board.format)} · {board.venueName}
          </div>
          <h1 style={{ fontSize: 56, marginTop: 6 }}>
            {place} · {board.dateLabel}
          </h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div className="row">
            <span className="live" style={{ height: 34, fontSize: 13 }}>
              <i style={{ opacity: blink ? 0.25 : 1 }} />
              LIVE
            </span>
            {updated ? <span style={{ fontSize: 15, color: "var(--text)", fontWeight: 600 }}>Updated {updated}</span> : null}
          </div>
          <Seg tab={tab} onTab={onTab} width={400} />
        </div>
      </div>
      <div className="main09">
        <div>
          <div className="tbl">
            <div className="th">
              <div style={{ textAlign: "center" }}>Pos</div>
              <div style={{ textAlign: "center" }}>Move</div>
              <div>Player</div>
              <div>Card</div>
              <div className="r">Thru</div>
              <div className="r">Gross</div>
              <div className="r">Net</div>
              <div className="r">Pts</div>
            </div>
            {rows.map((row) => (
              <TvRow key={row.playerId} row={row} />
            ))}
          </div>
          <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <div className="note">
              <GdIcon name="flag" size={16} />
              <span>
                <b>Ties split on countback:</b> {board.countback ?? "last 9, 6, 3, 1"} (applied at the finish)
              </span>
            </div>
            {board.watchLabel ? <div className="note" style={{ color: "var(--sub)" }}>Watch: {board.watchLabel}</div> : null}
          </div>
        </div>
        <div>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Live feed</div>
            <span style={{ fontSize: 13, color: "var(--sub)", fontWeight: 600 }}>newest first</span>
          </div>
          <FeedList items={board.feed} />
          <div className="card soft" style={{ marginTop: 14, padding: "10px 16px" }}>
            {board.cards.map((card) => (
              <div key={card.id} className="cs">
                <span className="tag dark">Card {card.number}</span>
                Thru {card.thru}
                <span style={{ marginLeft: "auto" }}>
                  {card.syncedAt ? (
                    <>
                      <GdIcon name="check" size={16} /> synced {johannesburgClock(card.syncedAt)}
                    </>
                  ) : (
                    "Waiting"
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TvRow({ row }: { row: RankingRow }) {
  const leader = row.positionNumber === 1;
  const move = row.move ?? 0;
  return (
    <div className="tr">
      {leader ? (
        <>
          <div className="hl" />
          <div className="bar" />
        </>
      ) : null}
      <div className="pos">{row.position ?? "–"}</div>
      <div className={`mvd ${move > 0 ? "up" : move < 0 ? "dn" : ""}`}>
        {move > 0 ? <span>▲{move}</span> : move < 0 ? `▼${Math.abs(move)}` : ""}
      </div>
      <div className="nm">{row.displayName}</div>
      <div>Card {row.cardNumber}</div>
      <div className="r num">{row.thru}</div>
      <div className="r num">{row.gross ?? "–"}</div>
      <div className="r num">{row.net ?? "–"}</div>
      <div className="pts">{row.stableford ?? "–"}</div>
    </div>
  );
}

export function DesktopSpectator({
  board,
  tab,
  onTab,
  blink,
}: {
  board: GameDayLeaderboard;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  blink: boolean;
}) {
  const place = gameDayPlaceName(board.venueName);
  const rows = board.rankings[tab];
  const updated = board.updatedLabel || (board.feed[0] ? johannesburgClock(board.feed[0].at) : "");
  const players = rows.length;
  const big = tab === "stableford" ? "pts" : "topar";
  const feed = spectatorFeed(board.feed, tab, rows);
  return (
    <div className="gd-desk">
      <div className="watchbar">
        <div className="wrap">
          <GdIcon name="eye" size={20} /> Watching · view only. You can&apos;t enter or change scores.
        </div>
      </div>
      <div className="wrap">
        <div className="crumbs">
          <span>Home</span>
          <span>/</span>
          <span>Golf</span>
          <span>/</span>
          <span>
            {place} · {board.dateLabel}
          </span>
          <span>/</span>
          <b>Watch</b>
        </div>
        <div className="ph">
          <div>
            <div className="eyebrow">
              Live leaderboard · {scoringName(board.format)} · {players} players · {board.cardsTotal} cards
            </div>
            <h1>
              {place} · {board.dateLabel}
            </h1>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, paddingBottom: 6 }}>
            <div className="row">
              <span className="live" style={{ height: 34, fontSize: 13 }}>
                <i style={{ opacity: blink ? 0.25 : 1 }} />
                LIVE
              </span>
              {updated ? (
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Updated {updated} · refreshes itself</span>
              ) : null}
            </div>
            <Seg tab={tab} onTab={onTab} width={400} />
          </div>
        </div>
        <div className="cols c2w">
          <div>
            <SpecTable rows={rows} tab={tab} big={big} />
            <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
              <div className="note">
                <GdIcon name="flag" size={16} />
                <span>
                  <b>Ties split on countback:</b> {board.countback ?? "last 9, 6, 3, 1"}
                </span>
              </div>
              {board.watchLabel ? <span className="note" style={{ color: "var(--sub)" }}>Watch: {board.watchLabel}</span> : null}
            </div>
          </div>
          <div className="stack">
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>Live feed</span>
                <span style={{ fontSize: 13, color: "var(--sub)", fontWeight: 600 }}>newest first</span>
              </div>
              <FeedList items={feed} />
            </div>
            <div className="panel soft" style={{ padding: "12px 18px" }}>
              {board.cards.map((card) => {
                const syncedAt = spectatorSyncedAt(board.gameDayId, card);
                return (
                  <div key={card.id} className="row" style={{ minHeight: 40, fontSize: 14, fontWeight: 600 }}>
                    <span className="tag dark">Card {card.number}</span>
                    Thru {card.thru}
                    <span style={{ marginLeft: "auto" }} className="row">
                      <GdIcon name="check" size={16} /> {syncedAt ? `synced ${johannesburgClock(syncedAt)}` : "waiting"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="panel" style={{ padding: "18px 20px" }}>
              <div className="row">
                <GdIcon name="tv" size={22} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Put it on the clubhouse TV</div>
                  <div style={{ fontSize: 13, color: "var(--body)", marginTop: 2 }}>Open the watch link full-screen. It updates by itself.</div>
                </div>
              </div>
              <div className="field" style={{ marginTop: 12, paddingRight: 6, minHeight: 52 }}>
                <GdIcon name="link" size={18} />
                <span style={{ fontSize: 14 }}>{board.watchLabel ?? "leaguesports.co.za/w"}</span>
                <button
                  type="button"
                  className="pillbtn"
                  style={{ marginLeft: "auto" }}
                  onClick={() => void navigator.clipboard?.writeText(board.watchLabel ?? "")}
                >
                  <GdIcon name="copy" size={16} /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="ex" style={{ padding: "0 0 32px" }}>
          Example data: names, scores, tees, pars and stroke index are placeholders, not verified Zebula course data.
        </div>
      </div>
    </div>
  );
}

function SpecTable({ rows, tab, big }: { rows: RankingRow[]; tab: BoardTab; big: "pts" | "topar" }) {
  const cols = ["card", "thru", "gross", "net", big === "pts" ? "pts" : "topar"].filter((col, index, all) => all.indexOf(col) === index);
  const widths: Record<string, string> = { card: "80px", thru: "64px", gross: "70px", net: "70px", pts: "70px", topar: "80px" };
  const labels: Record<string, string> = { card: "Card", thru: "Thru", gross: "Gross", net: "Net", pts: "Pts", topar: "To par" };
  const template = `52px 1fr ${cols.map((col) => widths[col]).join(" ")}`;
  return (
    <div className="lb">
      <div className="lbh" style={{ gridTemplateColumns: template, height: 42, padding: "0 18px 0 8px" }}>
        <div style={{ textAlign: "center" }}>Pos</div>
        <div>Player</div>
        {cols.map((col) => (
          <div key={col} className="r">
            {labels[col]}
          </div>
        ))}
      </div>
      {rows.map((row) => {
        const toPar = tab === "gross" ? signedScore(row.toPar) : signedScore(netToPar(row));
        const under = tab === "gross" ? (row.toPar ?? 0) < 0 : (netToPar(row) ?? 0) < 0;
        const hcp = formatHandicap(row.handicapIndex) ?? "no hcp";
        return (
          <div key={row.playerId} className="lbr" style={{ gridTemplateColumns: template, minHeight: 52, padding: "0 18px 0 8px" }}>
            <div className="pos" style={{ fontSize: 24 }}>
              {row.position ?? "–"}
            </div>
            <div>
              <span className="pn" style={{ fontSize: 17 }}>
                {row.displayName}
              </span>{" "}
              <span className="pm" style={{ marginLeft: 6 }}>
                Card {row.cardNumber} · {hcp}
              </span>
            </div>
            {cols.map((col) => {
              if (col === "topar") {
                return (
                  <div key={col} className={`big ${under ? "under" : ""}`} style={{ fontSize: 30 }}>
                    {toPar}
                  </div>
                );
              }
              if (col === "pts" && big === "pts") {
                return (
                  <div key={col} className="big" style={{ fontSize: 30 }}>
                    {row.stableford ?? "–"}
                  </div>
                );
              }
              const text =
                col === "card"
                  ? `Card ${row.cardNumber}`
                  : col === "thru"
                    ? String(row.thru)
                    : col === "gross"
                      ? String(row.gross ?? "–")
                      : col === "net"
                        ? String(row.net ?? "–")
                        : String(row.stableford ?? "–");
              return (
                <div key={col} className="c num">
                  {text}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
