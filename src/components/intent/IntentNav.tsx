import type { IntentKind } from "@/lib/intent/paths";
import { intentPath } from "@/lib/intent/paths";
import Link from "next/link";

type IntentNavProps = {
  intent: IntentKind;
  activityName?: string | null;
  locationTitle?: string | null;
};

export function IntentNav({
  intent,
  activityName,
  locationTitle,
}: IntentNavProps) {
  const accent =
    intent === "watch"
      ? "bg-sky-500 hover:bg-sky-400"
      : "bg-emerald-500 hover:bg-emerald-400";

  return (
    <nav className="sticky top-16 z-40 border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={intentPath(intent)}
          className={`inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition-colors ${accent}`}
        >
          {intent === "watch" ? "Watch" : "Play"}
        </Link>
        {activityName ? (
          <>
            <span className="text-zinc-600" aria-hidden>
              /
            </span>
            <span className="truncate text-sm text-zinc-400">{activityName}</span>
          </>
        ) : null}
        {locationTitle ? (
          <>
            <span className="text-zinc-600" aria-hidden>
              /
            </span>
            <span className="truncate text-sm text-zinc-300">{locationTitle}</span>
          </>
        ) : null}
        <div className="ml-auto hidden sm:block">
          <a
            href="#venues"
            className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/6 hover:text-white"
          >
            Venues
          </a>
        </div>
      </div>
    </nav>
  );
}
