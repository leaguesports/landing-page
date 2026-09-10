import Link from "next/link";
import { RaceReplay } from "./RaceReplay";

export function RaceReplaySection({
  sessionKey,
  eventSlug,
  title,
  replayHref,
  tone = "event",
}: {
  sessionKey?: number | null;
  eventSlug?: string | null;
  title: string;
  replayHref?: string | null;
  tone?: "event" | "motorsport";
}) {
  if (!sessionKey && !eventSlug) return null;
  const motorsport = tone === "motorsport";
  return (
    <section
      id="race-replay"
      aria-labelledby="race-replay-heading"
      className={
        motorsport
          ? "scroll-mt-24 py-12 sm:py-20 px-4 sm:px-6 lg:px-8"
          : "scroll-mt-24 border-b border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      }
    >
      <div className="mx-auto max-w-7xl">
        <p
          className={
            motorsport
              ? "text-xs font-black uppercase tracking-[0.2em] text-red-400"
              : "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]"
          }
        >
          3D race replay
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="race-replay-heading"
              className={
                motorsport
                  ? "mt-2 text-xl sm:text-2xl font-black italic uppercase text-white"
                  : "mt-2 font-display text-3xl tracking-wide text-white sm:text-4xl"
              }
            >
              {title}
            </h2>
            <p
              className={
                motorsport
                  ? "mt-2 max-w-2xl text-zinc-500 font-bold uppercase tracking-widest text-xs sm:text-sm"
                  : "mt-3 max-w-2xl text-base leading-relaxed text-zinc-400"
              }
            >
              Rotate the circuit, follow a car, and scrub yellow flags, safety
              cars, and the chequered flag. Telemetry is loaded by our API.
            </p>
          </div>
          {replayHref ? (
            <Link
              href={replayHref}
              className={
                motorsport
                  ? "inline-flex min-h-11 items-center text-xs font-black uppercase italic tracking-wider text-zinc-400 hover:text-white"
                  : "inline-flex min-h-11 items-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              }
            >
              Full screen
            </Link>
          ) : null}
        </div>
        <div className="mt-8">
          <RaceReplay
            key={String(sessionKey ?? eventSlug)}
            sessionKey={sessionKey}
            eventSlug={eventSlug}
          />
        </div>
      </div>
    </section>
  );
}
