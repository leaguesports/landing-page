"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CommunityAvatar } from "@/components/communities/CommunityAvatar";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth/login-href";
import { useAuth } from "@/lib/auth/use-auth";
import {
  getPoolStandings,
  isPoolsUnavailable,
  joinPool,
  recordPoolResult,
  submitPoolPick,
  type PoolStandingRow,
  type PredictionPool,
} from "@/lib/pools/pools";
import { buildWhatsAppShareHref, poolInviteUrl } from "@/lib/pools/whatsapp-share";

type Props = {
  initialPool: PredictionPool;
};

function formatKickoff(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function winnerLabel(winner: "home" | "away" | "draw" | null): string {
  if (winner === "home") {
    return "Home";
  }
  if (winner === "away") {
    return "Away";
  }
  if (winner === "draw") {
    return "Draw";
  }
  return "—";
}

export function PoolJoinCard({ initialPool }: Props) {
  const { user } = useAuth();
  const [pool, setPool] = useState(initialPool);
  const [standings, setStandings] = useState<PoolStandingRow[] | null>(null);
  const [tip, setTip] = useState(initialPool.myPick?.tip ?? "");
  const [homeScore, setHomeScore] = useState(
    initialPool.myPick?.homeScore != null ? String(initialPool.myPick.homeScore) : "",
  );
  const [awayScore, setAwayScore] = useState(
    initialPool.myPick?.awayScore != null ? String(initialPool.myPick.awayScore) : "",
  );
  const [winner, setWinner] = useState<"home" | "away" | "draw" | "">(
    initialPool.myPick?.winner ?? "",
  );
  const [resultHome, setResultHome] = useState("");
  const [resultAway, setResultAway] = useState("");
  const [busy, setBusy] = useState<"join" | "pick" | "result" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inviteUrl = useMemo(() => poolInviteUrl(pool.inviteCode), [pool.inviteCode]);
  const whatsappHref = useMemo(
    () =>
      buildWhatsAppShareHref({
        inviteCode: pool.inviteCode,
        title: pool.title,
      }),
    [pool.inviteCode, pool.title],
  );
  const loginHref = getLoginPageHref(relativeAuthReturnTo(`/pools/${pool.inviteCode}`));
  const kickoff = formatKickoff(pool.kicksOffAt);

  async function onJoin() {
    setBusy("join");
    setError(null);
    const result = await joinPool(pool.inviteCode);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setPool(result.data);
  }

  async function onSubmitPick(event: React.FormEvent) {
    event.preventDefault();
    setBusy("pick");
    setError(null);
    const home = homeScore.trim() === "" ? undefined : Number(homeScore);
    const away = awayScore.trim() === "" ? undefined : Number(awayScore);
    const result = await submitPoolPick(pool.inviteCode, {
      tip: tip.trim() || undefined,
      homeScore: home,
      awayScore: away,
      winner: winner || undefined,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setPool(result.data);
  }

  async function onRecordResult(event: React.FormEvent) {
    event.preventDefault();
    setBusy("result");
    setError(null);
    const result = await recordPoolResult(pool.inviteCode, {
      homeScore: Number(resultHome),
      awayScore: Number(resultAway),
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setPool(result.data);
  }

  async function onLoadStandings() {
    const result = await getPoolStandings(pool.inviteCode);
    if (!result.ok) {
      if (isPoolsUnavailable(result)) {
        setError(result.message);
      } else {
        setError(result.message);
      }
      return;
    }
    setStandings(result.data.standings);
  }

  return (
    <article className="space-y-6 rounded-2xl border border-white/10 bg-[#141814] p-5 sm:p-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3dff87]">
          Invite-only pool
        </p>
        <h1 className="font-display text-2xl text-white sm:text-3xl">{pool.title}</h1>
        <p className="text-sm text-white/60">
          Fixture {" "}
          <Link href={`/events/${pool.fixtureSlug}`} className="text-[#3dff87] underline-offset-2 hover:underline">
            {pool.fixtureSlug}
          </Link>
          {kickoff ? ` · Tips lock at ${kickoff}` : " · Tips stay open until the host records the result"}
        </p>
        <p className="text-sm text-white/50">
          {pool.memberCount} {pool.memberCount === 1 ? "friend" : "friends"} in this pool. No money, no wallets — just
          tips.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25D366] px-4 text-sm font-semibold text-[#052010]"
        >
          Forward on WhatsApp
        </a>
        <a
          href={inviteUrl}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white"
        >
          Copy-ready link
        </a>
      </div>
      <p className="break-all font-mono text-xs text-white/45">{inviteUrl}</p>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!user ? (
        <p className="text-sm text-white/70">
          Guests can view this pool.{" "}
          <Link href={loginHref} className="text-[#3dff87] underline-offset-2 hover:underline">
            Sign in to join or lock a tip
          </Link>
          .
        </p>
      ) : null}

      {user && !pool.joined ? (
        <button
          type="button"
          onClick={() => void onJoin()}
          disabled={busy !== null}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#3dff87] px-5 text-sm font-semibold text-[#052010] disabled:opacity-60"
        >
          {busy === "join" ? "Joining…" : "Join this pool"}
        </button>
      ) : null}

      {pool.joined && !pool.locked ? (
        <form onSubmit={(event) => void onSubmitPick(event)} className="space-y-3">
          <p className="text-sm font-medium text-white">Your tip</p>
          <label className="block text-xs uppercase tracking-wide text-white/45">
            Note
            <input
              value={tip}
              onChange={(event) => setTip(event.target.value)}
              maxLength={160}
              placeholder="Home to nick it"
              className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs uppercase tracking-wide text-white/45">
              Home
              <input
                inputMode="numeric"
                value={homeScore}
                onChange={(event) => setHomeScore(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              />
            </label>
            <label className="block text-xs uppercase tracking-wide text-white/45">
              Away
              <input
                inputMode="numeric"
                value={awayScore}
                onChange={(event) => setAwayScore(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              />
            </label>
          </div>
          <fieldset className="flex flex-wrap gap-2">
            {(["home", "away", "draw"] as const).map((option) => (
              <label
                key={option}
                className={`inline-flex min-h-11 items-center rounded-full border px-3 text-sm ${
                  winner === option
                    ? "border-[#3dff87] bg-[#3dff87]/10 text-[#3dff87]"
                    : "border-white/15 text-white/70"
                }`}
              >
                <input
                  type="radio"
                  name="winner"
                  value={option}
                  checked={winner === option}
                  onChange={() => setWinner(option)}
                  className="sr-only"
                />
                {winnerLabel(option)}
              </label>
            ))}
          </fieldset>
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#3dff87] px-5 text-sm font-semibold text-[#052010] disabled:opacity-60"
          >
            {busy === "pick" ? "Saving…" : pool.myPick ? "Update tip" : "Lock in tip"}
          </button>
        </form>
      ) : null}

      {pool.locked ? (
        <p className="text-sm text-[#3dff87]">
          Tips are locked{pool.result ? ` · Final ${pool.result.homeScore}–${pool.result.awayScore}` : ""}.
        </p>
      ) : null}

      {pool.role === "owner" && !pool.result ? (
        <form onSubmit={(event) => void onRecordResult(event)} className="space-y-3 border-t border-white/10 pt-4">
          <p className="text-sm font-medium text-white">Host: record the final score</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs uppercase tracking-wide text-white/45">
              Home
              <input
                required
                inputMode="numeric"
                value={resultHome}
                onChange={(event) => setResultHome(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              />
            </label>
            <label className="block text-xs uppercase tracking-wide text-white/45">
              Away
              <input
                required
                inputMode="numeric"
                value={resultAway}
                onChange={(event) => setResultAway(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy === "result" ? "Recording…" : "Record result"}
          </button>
        </form>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">Friends in this pool</h2>
          <button type="button" onClick={() => void onLoadStandings()} className="text-xs text-[#3dff87]">
            Show standings
          </button>
        </div>
        <ul className="space-y-2">
          {pool.members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2">
              <CommunityAvatar name={member.displayName} avatarUrl={member.avatarUrl} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{member.displayName}</p>
                <p className="truncate text-xs text-white/45">
                  {member.role === "owner" ? "Host" : "Friend"}
                  {member.pick
                    ? ` · ${member.pick.homeScore ?? "?"}–${member.pick.awayScore ?? "?"} (${winnerLabel(member.pick.winner)})`
                    : " · no tip yet"}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {standings ? (
          <ol className="mt-4 space-y-1 text-sm text-white/70">
            {standings.map((row) => (
              <li key={row.userId}>
                #{row.rank} {row.displayName} · {row.points} pts
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </article>
  );
}
