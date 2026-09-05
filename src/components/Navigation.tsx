import Link from "next/link";
import NotificationCenter from "@/components/NotificationCenter";

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
          aria-label="Main"
        >
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-white sm:text-[1.75rem]"
          >
            LEAGUE
            <span className="text-[var(--color-brand)]">SPORTS</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter />
          </div>
        </nav>
      </div>
    </header>
  );
}
