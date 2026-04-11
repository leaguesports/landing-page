"use client";

import HomeLink from "@/components/HomeLink";
import { Trophy, Tv, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_ACTIVE: Record<"blue" | "green", string> = {
  blue: "text-blue-400",
  green: "text-green-400",
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
        "group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold tracking-wide transition-all duration-200 sm:px-4",
        active
          ? "bg-white/12 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] ring-1 ring-white/10"
          : "text-zinc-500 hover:bg-white/6 hover:text-zinc-200",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-4 w-4 shrink-0 transition-colors duration-200",
          active ? ICON_ACTIVE[iconTone] : "text-zinc-600 group-hover:text-zinc-400",
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
      <div className="border-b border-white/6 bg-[#0a0a0a]/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl supports-backdrop-filter:bg-[#0a0a0a]/70">
        <nav
          className="mx-auto flex h-15 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8"
          aria-label="Main"
        >
          <div className="min-w-0 shrink-0">
            <HomeLink />
          </div>

          <div
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-black/50 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
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
