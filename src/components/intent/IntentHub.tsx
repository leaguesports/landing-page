import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import Link from "next/link";

type IntentHubProps = {
  intent: IntentKind;
  activityName?: string | null;
  activitySlug?: string | null;
};

export function IntentHub({
  intent,
  activityName,
  activitySlug,
}: IntentHubProps) {
  const isWatch = intent === "watch";
  const accent = isWatch ? "text-sky-400" : "text-emerald-400";
  const wash = isWatch
    ? "from-sky-950/40 via-[#0c0f0c] to-[#0c0f0c]"
    : "from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]";
  const glow = isWatch ? "bg-sky-500/10" : "bg-emerald-400/10";

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className={`absolute inset-0 bg-linear-to-br ${wash}`} />
      <div
        className={`pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full ${glow} blur-3xl`}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
        >
          {isWatch ? "Bars & fan zones" : "Courts & clubs"}
        </p>
        <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          Find somewhere to{" "}
          <span className={accent}>{isWatch ? "watch" : "play"}</span>
          {activityName ? (
            <>
              <br />
              <span className="text-white">{activityName}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
          {activitySlug
            ? isWatch
              ? "Pick a suburb below to see venues screening this activity with live screens."
              : "Pick a suburb below to see venues hosting this sport."
            : isWatch
              ? "Start with a sport or series, then choose an area to see bars and fan zones near you."
              : "Start with a sport, then choose an area to see courts and clubs near you."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {!activitySlug ? (
            <a
              href="#browse"
              className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors ${
                isWatch
                  ? "bg-white hover:bg-sky-400 hover:text-white"
                  : "bg-emerald-400 hover:bg-emerald-300"
              }`}
            >
              {isWatch ? "Choose a sport" : "Choose a sport"}
            </a>
          ) : null}
          <Link
            href="/venues"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
          >
            Browse all venues
          </Link>
          {isWatch ? (
            <Link
              href="/events"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Upcoming fixtures
            </Link>
          ) : (
            <Link
              href={intentPath("play", "padel")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Play padel
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
