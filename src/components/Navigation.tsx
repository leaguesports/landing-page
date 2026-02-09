import Link from "next/link";
import SuburbSelector from "@/components/SuburbSelector";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-[#0f0f0f]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center space-x-2">
            <div className="text-xl font-bold tracking-tight text-white">
              <span>League</span>
              <span className="text-green-400">Sports</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/watch"
              className="text-md font-medium text-gray-300 transition-colors hover:text-white"
            >
              Watch
            </Link>
            <Link
              href="/play"
              className="text-md font-medium text-gray-300 transition-colors hover:text-white"
            >
              Play
            </Link>
          </div>

          {/* Suburb selector + CTA */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <SuburbSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
