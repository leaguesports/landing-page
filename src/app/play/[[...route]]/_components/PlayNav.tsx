const NAV_LINKS = [
    { label: "Venues", href: "#venues" },
    { label: "Players", href: "#players" },
];

type PlayNavProps = {
    /** Shown in the sticky bar when present (detail route). */
    sportName?: string | null;
};

export function PlayNav({ sportName }: PlayNavProps) {
    return (
        <nav className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
                    <div className="flex items-center gap-2 mr-6 shrink-0">
                        <div className="bg-green-600 px-3 py-1 transform -skew-x-6">
                            <span className="transform skew-x-6 block text-xs font-black uppercase tracking-widest text-white">
                                Play
                            </span>
                        </div>
                        {sportName ? (
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                {sportName}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-1 flex-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0 transform -skew-x-6"
                            >
                                <span className="transform skew-x-6 block">{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
