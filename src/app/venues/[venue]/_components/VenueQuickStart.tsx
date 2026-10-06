import { Zap } from "lucide-react";
import Link from "next/link";
import type { VenueQuickStartActivity } from "@/lib/venues/quick-start";

export function VenueQuickStart({
  venueName,
  activities,
  embedded = false,
}: {
  venueName: string;
  activities: VenueQuickStartActivity[];
  /** Sit inside a focused venue column. The default page layout is unchanged. */
  embedded?: boolean;
}) {
  if (activities.length === 0) return null;

  const cards = (
    <ul className={embedded ? "grid gap-4" : "grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5"}>
      {activities.map((activity) => (
        <li
          key={activity.id}
          className={
            embedded
              ? "flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141a17] p-5 sm:p-6"
              : "flex flex-col justify-between rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
          }
        >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  {activity.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {activity.description}
                </p>
              </div>
              <Link
                href={activity.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                <Zap className="h-4 w-4" aria-hidden />
                {activity.cta}
              </Link>
            </li>
          ))}
    </ul>
  );

  const header = (
    <header className="mb-8 sm:mb-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
        Quick start
      </p>
      <h2
        className={`font-display text-3xl tracking-wide text-white sm:text-4xl${embedded ? " uppercase" : ""}`}
      >
        Play here
      </h2>
      <p className="mt-2 max-w-xl text-sm text-zinc-500">
        Start a live match from the sports {venueName} hosts.
      </p>
    </header>
  );

  if (embedded) {
    return (
      <section id="quick-start" className="scroll-mt-28">
        {header}
        {cards}
      </section>
    );
  }

  return (
    <section
      id="quick-start"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {header}
        {cards}
      </div>
    </section>
  );
}
