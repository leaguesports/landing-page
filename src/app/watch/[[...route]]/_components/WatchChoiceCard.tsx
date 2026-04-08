import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { SportIcon } from "@/components/icons/sports";

type WatchChoiceCardProps = {
    href: string;
    title: string;
    subtitle?: string;
    /**
     * Sport slug for the icon map. Omit for no icon (e.g. series without a linked sport).
     * Series cards should pass the parent sport’s slug, not the series slug.
     */
    sportIconSlug?: string;
};

export function WatchChoiceCard({ href, title, subtitle, sportIconSlug }: WatchChoiceCardProps) {
    const showSportIcon = sportIconSlug !== undefined;

    return (
        <Link
            href={href}
            className="group relative flex flex-col rounded-xl border border-zinc-800/90 bg-zinc-950/90 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-blue-950/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
            <div className="h-1 w-full rounded-t-xl bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600 opacity-90 transition-opacity group-hover:opacity-100" />
            <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    {showSportIcon ? (
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-950/50 text-blue-400 transition-colors group-hover:border-blue-400/40 group-hover:bg-blue-950/70"
                            aria-hidden
                        >
                            <SportIcon sportSlug={sportIconSlug} size={26} color="currentColor" />
                        </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                        <h3 className="font-black italic uppercase text-base sm:text-lg leading-snug text-white transition-colors group-hover:text-blue-400">
                            {title}
                        </h3>
                        {subtitle ? (
                            <p className="mt-2 text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="mt-auto flex items-center justify-end gap-1 text-blue-400/90 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">
                        Open
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>
        </Link>
    );
}
