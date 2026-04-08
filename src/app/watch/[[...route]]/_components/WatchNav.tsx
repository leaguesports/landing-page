import Link from "next/link";

const DETAIL_LINKS = [{ label: "Venues", href: "#venues" }];

type WatchNavProps = {
    /** Shown next to the Watch badge when present. */
    sportName?: string | null;
    /** Hub: browse sports/locations. Detail: sport + in-page anchors. */
    variant?: "hub" | "detail";
};

export function WatchNav({ sportName, variant = "hub" }: WatchNavProps) {
    return (
        <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                    <div className="flex items-center gap-2 sm:gap-3 mr-4 sm:mr-8 shrink-0">
                        <Link
                            href="/watch"
                            className="bg-blue-600 px-3 py-1 transform -skew-x-6 hover:bg-blue-500 transition-colors"
                        >
                            <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                Watch
                            </span>
                        </Link>
                        {sportName ? (
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest hidden sm:inline max-w-[min(12rem,40vw)] truncate">
                                {sportName}
                            </span>
                        ) : null}
                    </div>

                    {variant === "detail" ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                            {DETAIL_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6"
                                >
                                    <span className="transform skew-x-6 block">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hidden sm:block truncate">
                            LeagueSports
                        </p>
                    )}
                </div>
            </div>
        </nav>
    );
}
