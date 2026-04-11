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
        "group flex min-h-11 min-w-0 touch-manipulation items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold tracking-wide transition-[color,background-color,box-shadow,transform] duration-150 sm:min-h-0 sm:gap-2 sm:px-4 sm:text-sm",
        active
          ? "bg-white/12 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] ring-1 ring-white/10 active:bg-white/16"
          : "text-zinc-500 hover:bg-white/6 hover:text-zinc-200 active:bg-white/10",
        "active:scale-[0.98] motion-reduce:active:scale-100",
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
      <div className="border-b border-white/6 bg-[#0a0a0a]/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:bg-[#0a0a0a]/80 sm:backdrop-blur-xl supports-backdrop-filter:sm:bg-[#0a0a0a]/70">
        <nav
          className="mx-auto flex h-15 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8"
          aria-label="Main"
        >
          <div className="min-w-0 shrink-0">
            <HomeLink />
          </div>

          <div
            className="-skew-x-6 inline-flex max-w-[min(100%,calc(100vw-7rem))] shrink-0 items-center gap-0.5 overflow-hidden rounded-lg border border-white/10 bg-black/50 p-0.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:max-w-none sm:p-1"
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
