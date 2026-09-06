import type {
  IntentAmenityStat,
  IntentScreeningHighlight,
} from "@/lib/intent/enrichment";
import type { IntentKind } from "@/lib/intent/paths";
import { CalendarDays, Sparkles } from "lucide-react";

type IntentHighlightsProps = {
  intent: IntentKind;
  amenityStats: IntentAmenityStat[];
  screenings: IntentScreeningHighlight[];
  verifiedCount: number;
};

function formatScreeningWhen(value: string): string {
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function IntentHighlights({
  intent,
  amenityStats,
  screenings,
  verifiedCount,
}: IntentHighlightsProps) {
  if (
    amenityStats.length === 0 &&
    screenings.length === 0 &&
    verifiedCount <= 0
  ) {
    return null;
  }

  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";

  return (
    <section className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <div>
          <p
            className={`mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            At a glance
          </p>
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            What these listings offer
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            {verifiedCount > 0 ? (
              <li>
                {verifiedCount} verified{" "}
                {verifiedCount === 1 ? "venue" : "venues"} on LeagueSports
              </li>
            ) : null}
            {amenityStats.map((stat) => (
              <li key={stat.key}>{stat.label}</li>
            ))}
            {amenityStats.length === 0 && verifiedCount <= 0 ? (
              <li>Open each venue for the latest facility details.</li>
            ) : null}
          </ul>
        </div>

        {intent === "watch" && screenings.length > 0 ? (
          <div>
            <p
              className={`mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Upcoming screenings
            </p>
            <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
              On the calendar
            </h2>
            <ul className="mt-4 space-y-3">
              {screenings.map((item) => (
                <li
                  key={`${item.venueName}-${item.startsAt}-${item.title}`}
                  className="rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.venueName} · {formatScreeningWhen(item.startsAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
