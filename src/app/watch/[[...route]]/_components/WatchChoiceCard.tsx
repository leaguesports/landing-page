import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { SportIcon } from "@/components/icons/sports";

type WatchChoiceCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  sportIconSlug?: string;
};

export function WatchChoiceCard({
  href,
  title,
  subtitle,
  sportIconSlug,
}: WatchChoiceCardProps) {
  const showSportIcon = sportIconSlug !== undefined;

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl border border-white/8 bg-[#141814] p-5 transition-colors hover:border-sky-400/30 sm:p-6"
    >
      <div className="flex flex-1 items-start gap-4">
        {showSportIcon ? (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-400 transition-colors group-hover:border-sky-400/40"
            aria-hidden
          >
            <SportIcon sportSlug={sportIconSlug} size={26} color="currentColor" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium leading-snug text-white transition-colors group-hover:text-sky-300 sm:text-lg">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-sky-400" />
      </div>
    </Link>
  );
}
