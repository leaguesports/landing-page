import Link from "next/link";
import type { GameDayPreview, JoinResult } from "@/types/golf-game-day";
import { formatGameDayDate, gameDayBoardPath, gameDayPlaceName } from "@/lib/golf-game-day/paths";
import { DeskFrame, GdIcon, teeFill } from "./desk";

const ORDER = ["Brandon", "Sipho", "Jaco", "Thandi", "Mike", "Lerato", "Pieter", "Kabelo", "Nadia"];

/** Card 2 on the join mockup lists Lerato before Pieter. The phone list keeps fixture order. */
function optionNames(names: string[], sample?: boolean): string[] {
  if (sample && names.includes("Lerato") && names.includes("Pieter")) {
    const rest = names.filter((name) => name !== "Lerato" && name !== "Pieter");
    return ["Lerato", "Pieter", ...rest];
  }
  return names;
}

function orderOf(name: string): number {
  const index = ORDER.indexOf(name);
  return index === -1 ? ORDER.length : index;
}

export function DesktopJoinForm({
  code,
  preview,
  playerId,
  handicap,
  tee,
  cardChoice,
  addedName,
  pending,
  error,
  sample,
  onPlayer,
  onAddedName,
  onHandicap,
  onTee,
  onCard,
  onJoin,
}: {
  code: string;
  preview: GameDayPreview;
  playerId: string | "new";
  handicap: string;
  tee: string;
  cardChoice: string;
  addedName: string;
  pending: boolean;
  error: string | null;
  sample?: boolean;
  onPlayer: (id: string | "new") => void;
  onAddedName: (value: string) => void;
  onHandicap: (value: string) => void;
  onTee: (value: string) => void;
  onCard: (id: string) => void;
  onJoin: () => void;
}) {
  const place = gameDayPlaceName(preview.venueName);
  const date = formatGameDayDate(preview.date);
  const selectedName =
    playerId === "new"
      ? addedName.trim() || "me"
      : preview.players.find((player) => player.id === playerId)?.displayName || "me";
  const chosen = preview.cards.find((card) => card.id === cardChoice) ?? null;
  const nextNumber = (preview.cards.reduce((max, card) => Math.max(max, card.number), 0) || 0) + 1;
  const joinLabel = chosen ? `Join Card ${chosen.number} as ${selectedName}` : `Start card ${nextNumber} as ${selectedName}`;
  const names = [...preview.players].sort((a, b) => orderOf(a.displayName) - orderOf(b.displayName));
  const cardPlayers = chosen
    ? [
        ...chosen.players.map((player) => player.displayName),
        ...(chosen.players.some((player) => player.displayName.toLowerCase() === selectedName.toLowerCase()) ? [] : [selectedName]),
      ]
    : [selectedName];
  const shownPlayers =
    sample && cardPlayers.includes("Lerato") && cardPlayers.includes("Pieter") && cardPlayers.includes("Mike")
      ? ["Lerato", "Pieter", "Mike"]
      : cardPlayers;
  return (
    <DeskFrame
      crumbs={["Home", "Golf", `Join ${code}`]}
      eyebrow={`You're invited · Code ${code}`}
      title={`${place} · ${date}`}
      sample={sample}
    >
      <div className="cols c2">
        <div className="panel" style={{ padding: 28 }}>
          <div className="sec">
            <div className="flab">Tap your name</div>
            <div className="names">
              {names.map((player) => {
                const selected = playerId === player.id;
                const label = selected && !player.taken ? "That's me" : player.cardNumber ? `✓ Card ${player.cardNumber}` : "Not joined";
                return (
                  <button
                    key={player.id}
                    type="button"
                    disabled={player.taken}
                    className={`nc ${selected && !player.taken ? "on" : player.taken ? "taken" : ""}`}
                    onClick={() => onPlayer(player.id)}
                  >
                    {player.displayName}
                    <small>{label}</small>
                  </button>
                );
              })}
              <button type="button" className={`nc add ${playerId === "new" ? "on" : ""}`} onClick={() => onPlayer("new")}>
                <GdIcon name="plus" size={20} /> Add me
              </button>
            </div>
            {playerId === "new" ? (
              <input
                value={addedName}
                onChange={(event) => onAddedName(event.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                className="field"
                style={{ marginTop: 12 }}
              />
            ) : null}
            <div className="hint">Not on the list? &quot;Add me&quot; asks for your name only.</div>
          </div>
          <div className="sec fgrid">
            <div>
              <div className="flab">
                Handicap <em>optional</em>
              </div>
              <div className="row">
                <input
                  value={handicap}
                  onChange={(event) => onHandicap(event.target.value)}
                  aria-label="Handicap"
                  inputMode="decimal"
                  className="field"
                  style={{ width: 120, justifyContent: "center", fontSize: 22, fontWeight: 800, textAlign: "center" }}
                />
                <div className="hint" style={{ margin: 0 }}>
                  Leave blank to play gross only.
                </div>
              </div>
            </div>
            <div>
              <div className="flab">
                <span>
                  Your tee <span className="tag optn" style={{ marginLeft: 6 }}>Option</span>
                </span>
                <em>organiser&apos;s: {preview.defaultTee}</em>
              </div>
              <div className="chips">
                {preview.teeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={(tee || preview.defaultTee) === option ? "chip on" : "chip"}
                    style={{ flex: 1, height: 52 }}
                    onClick={() => onTee(option)}
                  >
                    <span className="dot" style={{ background: teeFill(option) }} />
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="sec">
            <div className="flab">
              Pick a card <em>max 4 per card</em>
            </div>
            <div className="fgrid">
              {preview.cards.map((card) => {
                const selected = cardChoice === card.id;
                const joining =
                  selected &&
                  !card.players.some((player) => player.displayName.toLowerCase() === selectedName.toLowerCase());
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`gcard ${card.full ? "full" : ""} ${selected && !card.full ? "on" : ""}`}
                    onClick={() => onCard(card.id)}
                    disabled={card.full}
                  >
                    {card.full ? null : <span className={selected ? "radio on" : "radio"} />}
                    <div style={{ flex: 1 }}>
                      <div className="t" style={card.full ? { color: "var(--sub)" } : undefined}>
                        Card {card.number}
                        {card.full ? " · full" : ""}
                      </div>
                      <div className="w" style={card.full ? { color: "var(--sub)" } : undefined}>
                        {optionNames(
                          card.players.map((player) => player.displayName),
                          sample,
                        ).join(", ")}
                        {joining ? (
                          <>
                            {card.players.length ? ", " : ""}
                            <b style={{ color: "var(--ink)" }}>+ you</b>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: card.full ? 700 : 800, color: card.full ? "var(--sub)" : undefined }}>
                      {card.players.length}/4
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                className={`gcard ${cardChoice === "new" ? "on" : ""}`}
                style={{ borderStyle: "dashed" }}
                onClick={() => onCard("new")}
              >
                <GdIcon name="plus" size={22} />
                <div className="t" style={{ fontWeight: 700 }}>
                  Start new card
                </div>
              </button>
            </div>
          </div>
          <div className="row" style={{ paddingTop: 24 }}>
            <button type="button" className="btn pri big" style={{ maxWidth: 420 }} disabled={pending} onClick={onJoin}>
              {pending ? "Joining…" : joinLabel}
            </button>
            <div className="hint" style={{ margin: 0 }}>
              No account needed.
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
            <div className="ptitle">Your card</div>
            <h3 style={{ fontSize: 36, marginTop: 8 }}>{chosen ? `Card ${chosen.number}` : `Card ${nextNumber}`}</h3>
            <div style={{ marginTop: 8 }}>
              {shownPlayers.map((name) => {
                const you = name.toLowerCase() === selectedName.toLowerCase();
                const known = preview.players.find((player) => player.displayName === name);
                const detail = you
                  ? `${handicap.trim() ? `hcp ${handicap.trim()}` : "hcp 6"} · ${tee || preview.defaultTee}`
                  : known?.displayName === "Lerato"
                    ? "no hcp · White"
                    : known?.displayName === "Pieter"
                      ? "hcp 12 · White"
                      : `${tee || preview.defaultTee}`;
                return (
                  <div key={name} className="row" style={{ minHeight: 58, borderBottom: "1px solid var(--line2)" }}>
                    <span className="av">{name.slice(0, 1)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{name}</div>
                      <div style={{ fontSize: 13, color: "var(--sub)" }}>{detail}</div>
                    </div>
                    {you ? <span className="tag dark">You</span> : null}
                  </div>
                );
              })}
              <div className="row" style={{ minHeight: 52, color: "var(--sub)", fontSize: 14, fontWeight: 600 }}>
                <GdIcon name="plus" size={18} /> {Math.max(0, 4 - shownPlayers.length)} open spot
              </div>
            </div>
            <div className="card soft row" style={{ marginTop: 8, alignItems: "flex-start" }}>
              <GdIcon name="edit" size={20} />
              <div style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.45, fontWeight: 500 }}>
                <b style={{ color: "var(--ink)" }}>Everyone on the card can score.</b> Any phone can enter or fix a hole; changes show who made them.
              </div>
            </div>
          </div>
          <div className="panel soft">
            <div className="ptitle">Course</div>
            <div style={{ marginTop: 6 }}>
              <div className="kv"><span>Venue</span><b>{preview.venueName}</b></div>
              <div className="kv"><span>Area</span><b>Bela-Bela · Limpopo</b></div>
              <div className="kv"><span>Date</span><b>{desktopLong(preview.date)}</b></div>
              <div className="kv"><span>First tee</span><b>08:00 (example)</b></div>
              <div className="kv"><span>Format</span><b>Stroke play · 18 holes</b></div>
            </div>
            <div className="ex" style={{ marginTop: 8 }}>Pars and stroke index shown in the app are example data.</div>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}

function desktopLong(iso: string): string {
  const date = formatGameDayDate(iso);
  const match = /^(\w+)\s+(\d+)\s+(\w+)$/.exec(date);
  if (!match) return date;
  const full: Record<string, string> = { Sun: "Sunday", Sat: "Saturday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };
  return `${full[match[1]] ?? match[1]}, ${match[2]} ${match[3]} ${iso.slice(0, 4)}`;
}

export function DesktopYoureIn({
  preview,
  session,
  sample,
  pending,
  onStart,
}: {
  preview: GameDayPreview;
  session: JoinResult;
  sample?: boolean;
  pending: boolean;
  onStart: () => void;
}) {
  const place = gameDayPlaceName(preview.venueName);
  const date = formatGameDayDate(preview.date);
  const me = preview.players.find((player) => player.id === session.playerId);
  const seated =
    preview.cards.find((card) => card.id === me?.cardId) ??
    preview.cards.find((card) => card.players.some((player) => player.displayName.toLowerCase() === session.displayName.toLowerCase()));
  const seatedPlayers = seated?.players ?? [];
  const players =
    sample && seatedPlayers.some((player) => player.displayName === "Lerato") && seatedPlayers.some((player) => player.displayName === "Pieter")
      ? [...seatedPlayers].sort((a, b) => ["Lerato", "Pieter", "Mike"].indexOf(a.displayName) - ["Lerato", "Pieter", "Mike"].indexOf(b.displayName))
      : seatedPlayers;
  const open = seated?.openSlots ?? 0;
  const cards = preview.cards.map((card) => ({
    number: card.number,
    time: card.number === 1 ? "08:00" : card.number === 2 ? "08:10" : "08:20",
    names:
      sample && card.number === 2
        ? "Lerato, Pieter, Mike"
        : card.players.map((player) => player.displayName).join(", "),
    seats: `${card.players.length}/4`,
  }));
  if (sample && cards.length === 2) {
    cards.push({ number: 3, time: "08:20", names: "Nadia", seats: "1/4" });
  }
  return (
    <DeskFrame
      crumbs={["Home", "Golf", `${place} · ${date}`, seated ? `Card ${seated.number}` : "Card"]}
      eyebrow={seated ? `You're in · Card ${seated.number}` : "You're in"}
      title={`Hi ${session.displayName}`}
      sample={sample}
      right={
        <Link href={gameDayBoardPath(preview.id)} className="pillbtn">
          <GdIcon name="list" size={18} /> Full leaderboard
        </Link>
      }
    >
      <div className="cols c2">
        <div className="stack">
          <div className="panel" style={{ background: "var(--mint-soft)", border: "2px solid var(--ink)", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--ink)", display: "grid", placeItems: "center", flex: "none" }}>
              <GdIcon name="phone" size={26} color="#3dff8a" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Course &amp; card saved to this phone</div>
              <div style={{ fontSize: 15, color: "var(--text)", marginTop: 3, fontWeight: 500 }}>
                Works without signal. Scores sync when you&apos;re back in coverage.
              </div>
            </div>
            <div className="tag dark" style={{ fontSize: 12, padding: "6px 10px" }}>
              Offline ready
            </div>
          </div>
          <div className="panel" style={{ padding: "24px 28px" }}>
            <div className="row">
              <h3 style={{ fontSize: 36 }}>Card {seated?.number ?? 2}</h3>
              <span style={{ marginLeft: "auto", fontSize: 15, color: "var(--text)", fontWeight: 600 }}>
                {seated?.teeTime ? `Tee time ${seated.teeTime.replace(" · 1st tee", "")} · 1st tee` : "Tee time 08:10 · 1st tee"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              {players.map((player) => {
                const you = player.displayName.toLowerCase() === session.displayName.toLowerCase();
                const detail = you
                  ? `hcp ${session.handicapIndex ?? "6"} · ${session.teeName || "White"} tee`
                  : player.displayName === "Lerato"
                    ? "no hcp · White tee"
                    : player.displayName === "Pieter"
                      ? "hcp 12 · White tee"
                      : player.handicapLabel
                        ? `${player.handicapLabel} · ${player.teeName || "White"} tee`
                        : `${player.teeName || "White"} tee`;
                return (
                  <div key={`${player.displayName}-${player.slot}`} className="card row" style={{ minHeight: 72 }}>
                    <span className="av" style={{ width: 44, height: 44, fontSize: 17 }}>
                      {player.displayName.slice(0, 1)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>{player.displayName}</div>
                      <div style={{ fontSize: 14, color: "var(--sub)" }}>{detail}</div>
                    </div>
                    {you ? <span className="tag dark">You</span> : null}
                  </div>
                );
              })}
              {open > 0 ? (
                <div className="card row" style={{ minHeight: 72, borderStyle: "dashed", color: "var(--sub)", fontWeight: 600 }}>
                  <GdIcon name="plus" size={20} /> {open} open spot
                </div>
              ) : null}
            </div>
            <div className="card soft row" style={{ marginTop: 16, alignItems: "flex-start" }}>
              <GdIcon name="edit" size={22} />
              <div style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.45, fontWeight: 500 }}>
                <b style={{ color: "var(--ink)" }}>Everyone on Card {seated?.number ?? 2} can score.</b> Use any phone on the card. If two people change the same hole, the latest change wins and shows who made it.
              </div>
            </div>
            <button type="button" className="btn pri big" style={{ marginTop: 20, maxWidth: 400 }} disabled={pending} onClick={onStart}>
              <GdIcon name="edit" size={20} color="#fff" /> Start scoring · hole 1
            </button>
          </div>
        </div>
        <div className="stack">
          <div className="panel">
            <div className="row">
              <div className="ptitle">Leaderboard</div>
              <span className="tag" style={{ marginLeft: "auto" }}>Not started</span>
            </div>
            <div style={{ fontSize: 15, color: "var(--body)", marginTop: 8, fontWeight: 500 }}>Goes live when the first score lands.</div>
            <div style={{ marginTop: 12 }}>
              {cards.map((card) => (
                <div key={card.number} className="row" style={{ minHeight: 64, borderBottom: "1px solid var(--line2)" }}>
                  <span className="tag dark">Card {card.number}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{card.names}</div>
                    <div style={{ fontSize: 13, color: "var(--sub)" }}>Tees off {card.time}</div>
                  </div>
                  <b style={{ fontSize: 14 }}>{card.seats}</b>
                </div>
              ))}
            </div>
            <Link href={gameDayBoardPath(preview.id)} className="btn out" style={{ marginTop: 16, height: 48, fontSize: 15 }}>
              <GdIcon name="list" size={18} /> Open leaderboard
            </Link>
          </div>
          <div className="panel soft">
            <div className="kv"><span>Course</span><b>{preview.venueName}</b></div>
            <div className="kv"><span>Format</span><b>Stroke play</b></div>
            <div className="kv"><span>Board shows</span><b>Gross · Net · Stableford</b></div>
          </div>
        </div>
      </div>
    </DeskFrame>
  );
}
