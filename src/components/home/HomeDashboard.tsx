import Link from "next/link";
import { PadelHistoryList } from "@/components/padel/PadelHistoryList";
import type { AuthUser } from "@/lib/api-client";
import { lookupPlayerHistory } from "@/lib/padel/lookup-history";
import type { PadelHistoryItem } from "@/types/padel-match";

type HomeDashboardProps = {
  user: AuthUser;
  cookie: string;
};

function displayName(user: AuthUser): string {
  return (
    user.displayName?.trim() ||
    user.name?.trim() ||
    user.handle?.trim() ||
    user.email?.trim() ||
    "Player"
  );
}

export async function HomeDashboard({ user, cookie }: HomeDashboardProps) {
  const history = await lookupPlayerHistory(user.id, { cookie });
  const items: PadelHistoryItem[] = history.error ? [] : history.items;
  const recent = items.slice(0, 8);
  const name = displayName(user);
  const handle = user.handle?.trim();

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -right-24 top-0 h-[22rem] w-[22rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            LeagueSports
          </p>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-14 w-14 rounded-full border border-white/10 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#141814] font-display text-2xl text-emerald-300">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
                  {name}
                </h1>
                {handle ? (
                  <p className="mt-1 text-sm text-zinc-400">@{handle}</p>
                ) : null}
              </div>
            </div>

            <Link
              href="/padel/new"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
            >
              Start padel match
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Sports you play
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
              Your sports
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/padel/history"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 text-sm font-medium text-emerald-200 transition-colors hover:border-emerald-300/50 hover:bg-emerald-400/15"
          >
            Padel
            <span className="tabular-nums text-emerald-300/80">
              {items.length}
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Recent activity
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-wide text-white">
              Locked matches
            </h2>
          </div>
          {items.length > 0 ? (
            <Link
              href="/padel/history"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              View all history
            </Link>
          ) : null}
        </div>

        {history.error ? (
          <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {history.error}
          </p>
        ) : recent.length === 0 ? (
          <div className="space-y-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-8 sm:px-8">
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              No locked padel matches yet. Start a match, play it out, and end
              the scorecard — only locked results land here.
            </p>
            <Link
              href="/padel/new"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              Start your first match
            </Link>
          </div>
        ) : (
          <PadelHistoryList items={recent} />
        )}
      </section>
    </div>
  );
}
