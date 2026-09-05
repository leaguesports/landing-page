import type { IntentKind } from "@/lib/intent/paths";
import type { IntentActivity } from "@/lib/intent/activity";

type IntentHeroProps = {
  intent: IntentKind;
  activity: IntentActivity;
  locationTitle: string;
  venueCount: number;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function IntentHero({
  intent,
  activity,
  locationTitle,
  venueCount,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: IntentHeroProps) {
  const accent = intent === "watch" ? "text-sky-400" : "text-emerald-400";
  const wash =
    intent === "watch"
      ? "from-sky-950/45 via-[#0c0f0c] to-[#0c0f0c]"
      : "from-emerald-950/45 via-[#0c0f0c] to-[#0c0f0c]";
  const glow =
    intent === "watch" ? "bg-sky-500/10" : "bg-emerald-400/10";
  const verb = intent === "watch" ? "Watch" : "Play";
  const supporting =
    intent === "watch"
      ? venueCount > 0
        ? `${venueCount} ${venueCount === 1 ? "venue" : "venues"} with live screens for ${activity.name}.`
        : `Find bars and fan zones screening ${activity.name} near ${locationTitle}.`
      : venueCount > 0
        ? `${venueCount} ${venueCount === 1 ? "venue" : "venues"} where you can play ${activity.name}.`
        : `Find courts and clubs for ${activity.name} near ${locationTitle}.`;

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className={`absolute inset-0 bg-linear-to-br ${wash}`} />
      <div
        className={`pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full ${glow} blur-3xl`}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
        >
          {verb} · {locationTitle}
        </p>
        <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          {activity.name}
          <span className={`block ${accent}`}>{locationTitle}</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
          {supporting}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={primaryHref}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors ${
              intent === "watch"
                ? "bg-white hover:bg-sky-400 hover:text-white"
                : "bg-emerald-400 hover:bg-emerald-300"
            }`}
          >
            {primaryLabel}
          </a>
          <a
            href={secondaryHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
