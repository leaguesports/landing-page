import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-[#0f0f0f]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold tracking-tight text-white">
              <span>League</span>
              <span className="text-green-400">Sports</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/play"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Play
            </Link>
            <Link
              href="/watch"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Watch
            </Link>
            <Link
              href="/sports"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Sports
            </Link>
            <Link
              href="/athletes"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Athletes
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              About
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-gray-100"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
