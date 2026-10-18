import type { GameDayCreated } from "@/types/golf-game-day";
import { formatGameDayDate, gameDayPlaceName, presentGameDay } from "@/lib/golf-game-day/paths";
import { DeskFrame, ExampleQr, GdIcon } from "./desk";

export function DesktopShare({
  day,
  copied,
  onCopy,
  sample,
}: {
  day: GameDayCreated;
  copied: "invite" | "watch" | "organiser" | null;
  onCopy: (kind: "invite" | "watch" | "organiser") => void;
  sample?: boolean;
}) {
  const shown = presentGameDay(day);
  const place = gameDayPlaceName(day.venueName);
  const date = formatGameDayDate(day.date);
  const joined = day.players.filter((player) => player.joined).length;
  const organiserShown =
    day.inviteCode === "ZB47"
      ? `leaguesports.co.za/o/${day.inviteCode}-k9f2-x7mq`
      : `leaguesports.co.za/golf/game-day/${day.id}`;
  return (
    <DeskFrame
      crumbs={["Home", "Golf", `${place} · ${date}`]}
      eyebrow={`Game day ready · Stroke play · ${day.defaultTee} tee`}
      title={`${place} · ${date}`}
      sample={sample}
      right={
        <span className="tag mint" style={{ fontSize: 12, padding: "6px 10px" }}>
          <GdIcon name="check" size={12} /> Created
        </span>
      }
    >
      <div className="cols c2">
        <div className="stack">
          <div className="panel" style={{ padding: 28 }}>
            <div className="ptitle">Join · for players</div>
            <div className="row" style={{ marginTop: 10, alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 14, color: "var(--sub)", fontWeight: 600 }}>Join code</div>
                <div className="bebas" style={{ fontSize: 88, lineHeight: 0.95, letterSpacing: "0.12em" }}>
                  {day.inviteCode}
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: 14, color: "var(--sub)", fontWeight: 600 }}>Join link</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>leaguesports.co.za/g/{day.inviteCode}</div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 20, gap: 12 }}>
              <a
                className="btn pri big"
                style={{ flex: 2 }}
                href={`https://wa.me/?text=${encodeURIComponent(`Join the game day\nhttps://leaguesports.co.za/g/${day.inviteCode}`)}`}
              >
                <GdIcon name="bubble" size={24} color="#fff" /> Share on WhatsApp
              </a>
              <button type="button" className="btn out big" style={{ flex: 1 }} onClick={() => onCopy("invite")}>
                <GdIcon name="copy" size={20} /> {copied === "invite" ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
          <div className="panel" style={{ border: "2px solid var(--ink)", padding: "24px 28px" }}>
            <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--ink)", display: "grid", placeItems: "center", flex: "none" }}>
                <GdIcon name="key" size={24} color="#3dff8a" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Save your organiser link</div>
                <div style={{ fontSize: 15, color: "var(--body)", marginTop: 4, lineHeight: 1.45 }}>
                  It&apos;s how you manage this game day without an account: edit players, fix or unlock cards, close the day. Keep it private.
                </div>
                <div className="field" style={{ marginTop: 14, paddingRight: 6, background: "var(--soft)", borderColor: "var(--line2)" }}>
                  <GdIcon name="lock" size={18} />
                  <span style={{ fontSize: 15 }}>
                    {day.inviteCode === "ZB47" ? (
                      <>
                        leaguesports.co.za/o/ZB47-<b>k9f2-x7mq</b>
                      </>
                    ) : (
                      organiserShown
                    )}
                  </span>
                  <button
                    type="button"
                    className="pillbtn dark"
                    style={{ marginLeft: "auto" }}
                    onClick={() => onCopy("organiser")}
                  >
                    <GdIcon name="copy" size={18} color="#fff" /> {copied === "organiser" ? "Copied" : "Copy organiser link"}
                  </button>
                </div>
                <div className="hint">Tip: send it to yourself on WhatsApp so you don&apos;t lose it.</div>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="row">
              <div className="ptitle">Players added</div>
              <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--sub)", fontWeight: 600 }}>
                {day.players.length} names · {joined} joined
              </span>
            </div>
            <div className="chips" style={{ marginTop: 14 }}>
              {day.players.map((player) => (
                <div key={player.id} className="chip" style={{ height: 44, background: "var(--soft)", borderColor: "var(--line2)" }}>
                  {player.displayName}
                  <span style={{ fontSize: 12, color: "var(--sub)", fontWeight: 500 }}>
                    {player.displayName === "Brandon" && player.joined ? "you · organiser" : player.joined ? "joined" : "not joined"}
                  </span>
                </div>
              ))}
            </div>
            <div className="hint" style={{ marginTop: 12 }}>
              Friends tap their name, pick a card (max 4) and play. Anyone else taps &quot;Add me&quot;.
            </div>
          </div>
        </div>
        <div className="stack">
          <div className="panel" style={{ textAlign: "center" }}>
            <div className="ptitle">Scan to join</div>
            <div style={{ width: 240, margin: "16px auto 0", padding: 14, border: "1.5px solid var(--line)", borderRadius: 16 }}>
              <ExampleQr />
            </div>
            <div className="ex" style={{ marginTop: 10 }}>Example QR · placeholder pattern</div>
            <div style={{ fontSize: 14, color: "var(--body)", marginTop: 6, fontWeight: 500 }}>Show this on your phone at the first tee.</div>
          </div>
          <div className="panel soft">
            <div className="row">
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", border: "1.5px solid var(--line)", display: "grid", placeItems: "center", flex: "none" }}>
                <GdIcon name="eye" size={22} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Watch link · view only</div>
                <div style={{ fontSize: 14, color: "var(--body)", marginTop: 2 }}>For family, the clubhouse TV, anyone not playing.</div>
              </div>
            </div>
            <div className="field" style={{ marginTop: 14, paddingRight: 6 }}>
              <GdIcon name="link" size={18} />
              <span style={{ fontSize: 15 }}>leaguesports.co.za/w/{day.watchToken}</span>
              <button type="button" className="pillbtn" style={{ marginLeft: "auto" }} onClick={() => onCopy("watch")}>
                <GdIcon name="copy" size={18} /> {copied === "watch" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="hint">Watchers see the live board and feed. They can&apos;t enter or change scores.</div>
          </div>
        </div>
      </div>
      <span className="sr-only">{shown.headline}</span>
    </DeskFrame>
  );
}
