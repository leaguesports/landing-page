import Link from "next/link";

const NAV_LINKS = [
  { label: "Venues", href: "#venues" },
  { label: "Players", href: "#players" },
];

type PlayNavProps = {
  sportName?: string | null;
};

export function PlayNav({ sportName }: PlayNavProps) {
  return (
    <nav className="sticky top-16 z-40 border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/play"
          className="inline-flex items-center rounded-full bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
        >
          Play
        </Link>
        {sportName ? (
          <span className="hidden truncate text-sm text-zinc-400 sm:inline">
            {sportName}
          </span>
        ) : (
          <span className="hidden text-sm text-zinc-600 sm:inline">
            Courts & clubs
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/6 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
