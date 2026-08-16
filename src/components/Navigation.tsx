"use client";

import { Trophy, Tv, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_ACTIVE: Record<"blue" | "green", string> = {
  blue: "text-sky-400",
  green: "text-emerald-400",
};

function WatchPlayLink({
  href,
  label,
  icon: Icon,
  iconTone,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  iconTone: keyof typeof ICON_ACTIVE;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        "group flex min-h-11 min-w-0 touch-manipulation items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors sm:min-h-0",
        active
          ? "bg-white text-zinc-950"
          : "text-zinc-400 hover:bg-white/8 hover:text-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-4 w-4 shrink-0 transition-colors",
          active ? ICON_ACTIVE[iconTone] : "text-zinc-500 group-hover:text-zinc-300",
        ].join(" ")}
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
          aria-label="Main"
        >
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-white sm:text-[1.75rem]"
          >
            LEAGUE
            <span className="text-[var(--color-brand)]">SPORTS</span>
          </Link>

          <div
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/4 p-1"
            role="presentation"
          >
            <WatchPlayLink href="/watch" label="Watch" icon={Tv} iconTone="blue" />
            <WatchPlayLink href="/play" label="Play" icon={Trophy} iconTone="green" />
          </div>
        </nav>
      </div>
    </header>
  );
}
