import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=80";

export function HomeDiscovery() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-start overflow-hidden sm:min-h-[88vh] sm:items-end">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center animate-mesh"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0c0f0c]/55" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0c0f0c] via-[#0c0f0c]/70 to-[#0c0f0c]/25" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0c0f0c]/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-14 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <h1 className="font-display animate-rise text-[clamp(3.25rem,12vw,9.5rem)] leading-[0.88] tracking-wide text-white">
          LEAGUE
          <span className="text-[var(--color-brand)]">SPORTS</span>
        </h1>

        <p className="animate-rise-delay mt-4 max-w-xl text-base leading-relaxed text-zinc-300 sm:mt-5 sm:text-lg">
          Play a padel match on a live scorecard. Lock the result so it lands
          on your history and the court.
        </p>

        <div className="animate-rise-delay-2 mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
          <Link
            href="/venues"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
          >
            Find a venue
          </Link>
          <Link
            href="/padel/new"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            Play now
          </Link>
        </div>
      </div>
    </section>
  );
}
