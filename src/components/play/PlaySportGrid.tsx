import type { HubPlayGridItem } from "@/lib/sports/hub-ia";
import { Flag, Target, Trophy } from "lucide-react";
import Link from "next/link";

function SportIcon({ slug }: { slug: string }) {
  if (slug === "golf") return <Flag className="h-6 w-6" aria-hidden />;
  if (slug === "darts") return <Target className="h-6 w-6" aria-hidden />;
  return <Trophy className="h-6 w-6" aria-hidden />;
}

type PlaySportGridProps = {
  items: readonly HubPlayGridItem[];
};

export function PlaySportGrid({ items }: PlaySportGridProps) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:max-w-4xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
        Play
      </p>
      <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
        Pick a sport
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
        Start a live scorecard, capture a finished game, or play with others.
      </p>

      {items.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className="flex h-full w-full flex-col items-start gap-5 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 text-left transition-colors hover:border-emerald-400/35 hover:bg-white/3 sm:px-6 lg:px-7 lg:py-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-emerald-200">
                  <SportIcon slug={item.slug} />
                </span>
                <div>
                  <h2 className="font-display text-3xl tracking-wide text-white">
                    {item.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm leading-relaxed text-zinc-400">
          No playable sports yet.
        </p>
      )}
    </section>
  );
}
