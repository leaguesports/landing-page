"use client";

import { CommunityAvatar } from "@/components/communities/CommunityAvatar";
import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  formatMemberCount,
  formatPoolWinner,
  isPoolsUnavailable,
  joinPool,
  recordPoolResult,
  submitPoolPick,
  type PoolStanding,
  type PredictionPool,
} from "@/lib/pools/pools";
import { buildPoolWhatsAppShare } from "@/lib/pools/whatsapp-share";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

type PoolJoinCardProps = {
  pool: PredictionPool;
  fixtureTitle: string;
  standings: PoolStanding[];
};

function sendToLogin(code: string) {
  const returnTo =
    (typeof window !== "undefined" && relativeAuthReturnTo()) ||
    `/pools/${code}`;
  window.location.href = getLoginPageHref(returnTo);
}

export function PoolJoinCard({
  pool,
  fixtureTitle,
  standings,
}: PoolJoinCardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [current, setCurrent] = useState(pool);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState(
    current.myPick?.homeScore?.toString() ?? "",
  );
  const [awayScore, setAwayScore] = useState(
    current.myPick?.awayScore?.toString() ?? "",
  );
  const [tip, setTip] = useState(current.myPick?.tip ?? "");
  const [resultHome, setResultHome] = useState("");
  const [resultAway, setResultAway] = useState("");
  const [pending, startTransition] = useTransition();

  const share = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://leaguesports.co.za";
    return buildPoolWhatsAppShare({
      inviteCode: current.inviteCode,
      fixtureTitle,
      poolTitle: current.title,
      origin,
    });
  }, [current.inviteCode, current.title, fixtureTitle]);

  function onJoin() {
    setError(null);
    setMessage(null);
    if (!isAuthenticated) {
      sendToLogin(current.inviteCode);
      return;
    }
    startTransition(() => {
      void joinPool(current.inviteCode).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(current.inviteCode);
            return;
          }
          if (isPoolsUnavailable(result.status)) {
            setError("Prediction pools aren’t live on this environment yet.");
            return;
          }
          setError(result.error);
          return;
        }
        setCurrent(result.value);
        setMessage("You’re in. Lock a tip before kickoff.");
        router.refresh();
      });
    });
  }

  function onPick(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!isAuthenticated) {
      sendToLogin(current.inviteCode);
      return;
    }

    const home = homeScore.trim() === "" ? null : Number.parseInt(homeScore, 10);
    const away = awayScore.trim() === "" ? null : Number.parseInt(awayScore, 10);
    if (
      (homeScore.trim() && !Number.isInteger(home)) ||
      (awayScore.trim() && !Number.isInteger(away))
    ) {
      setError("Scores must be whole numbers.");
      return;
    }

    startTransition(() => {
      void submitPoolPick(current.inviteCode, {
        tip: tip.trim() || null,
        homeScore: home,
        awayScore: away,
      }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(current.inviteCode);
            return;
          }
          setError(result.error);
          return;
        }
        setCurrent(result.value);
        setMessage("Tip saved.");
        router.refresh();
      });
    });
  }

  function onResult(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const home = Number.parseInt(resultHome, 10);
    const away = Number.parseInt(resultAway, 10);
    if (!Number.isInteger(home) || !Number.isInteger(away)) {
      setError("Result scores must be whole numbers.");
      return;
    }
    startTransition(() => {
      void recordPoolResult(current.inviteCode, {
        homeScore: home,
        awayScore: away,
      }).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setCurrent(result.value);
        setMessage("Result recorded. Standings are up.");
        router.refresh();
      });
    });
  }

  const heading = current.title?.trim() || `${fixtureTitle} tips`;

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href={`/events/${current.fixtureSlug}`}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← {fixtureTitle}
        </Link>

        <header className="mt-6 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Prediction pool
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-white sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {fixtureTitle} · {formatMemberCount(current.memberCount)}
            {current.locked ? " · Tips locked" : " · Tips open until kickoff"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!current.joined ? (
              <button
                type="button"
                disabled={pending || authLoading}
                onClick={onJoin}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-sky-400 hover:text-white disabled:opacity-60"
              >
                {isAuthenticated ? "Join pool" : "Sign in to join"}
              </button>
            ) : (
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-sky-200">
                {current.role ?? "member"}
              </span>
            )}
            <a
              href={share.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-zinc-950 hover:bg-[#1ebe5d]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </a>
          </div>
          <p className="mt-3 break-all text-xs text-zinc-500">{share.poolUrl}</p>
        </header>

        {current.joined && !current.locked ? (
          <form
            onSubmit={onPick}
            className="mt-8 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
          >
            <h2 className="font-display text-2xl tracking-wide text-white">
              Your tip
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Score or winner before kickoff. Friends only — no stakes.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Home
                </span>
                <input
                  inputMode="numeric"
                  value={homeScore}
                  onChange={(event) => setHomeScore(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Away
                </span>
                <input
                  inputMode="numeric"
                  value={awayScore}
                  onChange={(event) => setAwayScore(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                Optional note
              </span>
              <input
                value={tip}
                onChange={(event) => setTip(event.target.value)}
                maxLength={140}
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-sky-300 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save tip"}
            </button>
          </form>
        ) : null}

        {current.role === "owner" && !current.result ? (
          <form
            onSubmit={onResult}
            className="mt-8 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
          >
            <h2 className="font-display text-2xl tracking-wide text-white">
              Record result
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Manual v1 entry. Locks remaining tips and scores the table.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Home
                </span>
                <input
                  inputMode="numeric"
                  value={resultHome}
                  onChange={(event) => setResultHome(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Away
                </span>
                <input
                  inputMode="numeric"
                  value={resultAway}
                  onChange={(event) => setResultAway(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950 disabled:opacity-60"
            >
              Lock result
            </button>
          </form>
        ) : null}

        {error ? (
          <p className="mt-6 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-6 text-sm text-sky-200" role="status">
            {message}
          </p>
        ) : null}

        <section className="mt-10" aria-labelledby="pool-standings-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Standings
          </p>
          <h2
            id="pool-standings-heading"
            className="mt-1 font-display text-2xl tracking-wide text-white"
          >
            {current.result
              ? `${current.result.homeScore}–${current.result.awayScore} (${formatPoolWinner(current.result.winner)})`
              : "Waiting for the result"}
          </h2>
          {standings.length === 0 && current.members.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-400">No players yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {(standings.length > 0 ? standings : current.members.map((member) => ({
                userId: member.id,
                displayName: member.displayName,
                handle: member.handle,
                avatarUrl: member.avatarUrl,
                points: 0,
                rank: 1,
                pick: member.pick,
              }))).map((row) => (
                <li
                  key={row.userId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CommunityAvatar
                      name={row.displayName}
                      avatarUrl={row.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {row.rank}. {row.displayName}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {row.pick
                          ? row.pick.homeScore != null &&
                            row.pick.awayScore != null
                            ? `${row.pick.homeScore}–${row.pick.awayScore}`
                            : formatPoolWinner(row.pick.winner)
                          : "No tip yet"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-sky-200">
                    {row.points} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
