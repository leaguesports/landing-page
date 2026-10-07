import { SportIcon } from "@/components/icons/sports";
import { ChevronRight, MapPin, Trophy, Tv } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SPORTS = [
  { slug: "soccer", label: "Soccer" },
  { slug: "rugby", label: "Rugby" },
  { slug: "padel", label: "Padel" },
  { slug: "golf", label: "Golf" },
] as const;

const PATHS: {
  href: string;
  kicker: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/watch",
    kicker: "Watch",
    title: "Find a screen",
    description: "See which venues have the game on.",
    icon: Tv,
  },
  {
    href: "/play",
    kicker: "Play",
    title: "Find a court",
    description: "Padel, golf, and more near you.",
    icon: MapPin,
  },
  {
    href: "/athletes",
    kicker: "Track",
    title: "Lock a scorecard",
    description: "Keep the result on your athlete hub.",
    icon: Trophy,
  },
];

export function HomeDiscovery() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 text-white">
      <Image
        src="/images/home-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-linear-to-b from-[#0c0f0c]/70 via-[#0c0f0c]/25 to-[#0c0f0c]/75 lg:bg-linear-to-r lg:from-[#0c0f0c]/80 lg:via-[#0c0f0c]/30 lg:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0c0f0c] to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              South Africa
            </p>
            <h1 className="mt-2 max-w-xl font-display text-5xl tracking-wide text-white sm:text-7xl">
              Watch, play, and track sport in one place
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-zinc-200">
              Find screens for the big game, book a court, or lock a live
              scorecard — across soccer, rugby, padel, golf, and more.
            </p>
            <ul className="mt-6 flex gap-2" aria-label="Sports">
              {SPORTS.map((sport) => (
                <li key={sport.slug}>
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm"
                    title={sport.label}
                  >
                    <SportIcon sportSlug={sport.slug} size={22} color="currentColor" />
                    <span className="sr-only">{sport.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="grid gap-3">
            {PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <li key={path.href}>
                  <Link
                    href={path.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-[#0c0f0c]/55 p-4 backdrop-blur-md transition-colors hover:border-white/35 hover:bg-[#0c0f0c]/70 sm:p-5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                        {path.kicker}
                      </span>
                      <span className="mt-1 block font-display text-2xl leading-none tracking-wide text-white">
                        {path.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-snug text-zinc-300">
                        {path.description}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
