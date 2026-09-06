import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why LeagueSports exists: from finding venues as a sports fan in Germany to building something for South Africa.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />

        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Our story
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            Built by a fan,{" "}
            <span className="text-[var(--color-brand)]">for fans</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            LeagueSports started from a simple frustration I kept running into
            as someone who just wanted to watch and play sport in the right
            place, at the right time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="space-y-12 text-base leading-relaxed text-zinc-300 sm:text-lg">
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Germany
            </h2>
            <p>
              I built this platform while living in Germany as a sports fan. I
              love following games and getting out to play, but I found it
              genuinely hard to discover where to go: which pubs and venues show
              the matches I cared about, where I could book a court or pitch,
              and what was happening near me on any given weekend. Information
              was scattered across forums, club sites, and word of mouth.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              The idea
            </h2>
            <p>
              I wanted one place that respects how fans actually behave: you
              care about the fixture, the vibe, and the venue, not hunting
              through ten different sources. That is the problem LeagueSports
              sets out to solve: making it easier to find where to watch or
              play, and to feel confident you are headed somewhere that fits
              what you are looking for.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              South Africa
            </h2>
            <p>
              That experience made South Africa feel like a natural home for
              this product. Sport is woven into everyday life here, and the
              appetite to gather around a screen or get onto a field is huge,
              but the same fragmentation shows up: great venues and communities
              exist, yet they are not always easy to find when you are new to a
              city or trying something different. I believe a dedicated platform
              for venues, watching, and playing is an especially strong fit for
              this market, and I am building LeagueSports with that in mind.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-white/8 bg-[#141814] p-8 sm:p-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Explore the platform
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/watch"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
            >
              Watch
            </Link>
            <Link
              href="/play"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
            >
              Play
            </Link>
            <Link
              href="/venues"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
            >
              Venues
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
