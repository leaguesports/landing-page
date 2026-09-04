import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#0a0c0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-14 sm:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="space-y-4 md:col-span-1">
              <div className="font-display text-2xl tracking-wide text-white">
                LEAGUE
                <span className="text-[var(--color-brand)]">SPORTS</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
                South Africa&apos;s local sports platform — find where to watch,
                play, and meet your next match.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Discover
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/venues"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    Venues
                  </Link>
                </li>
                <li>
                  <Link
                    href="/watch"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    Watch
                  </Link>
                </li>
                <li>
                  <Link
                    href="/play"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    Play
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Community
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/guides"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    Guides
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row sm:items-center">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} LeagueSports. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600">Made for SA sports fans</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
