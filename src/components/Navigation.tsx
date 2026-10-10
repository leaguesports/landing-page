import Link from "next/link";
import { Suspense } from "react";
import { BrandMark } from "@/components/BrandMark";
import HeaderSessionControls from "@/components/HeaderSessionControls";
import {
  NavbarSearch,
  NavbarSearchFallback,
} from "@/components/search/NavbarSearch";

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-white/6 bg-[#0c0f0c]/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8"
          aria-label="Main"
        >
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 font-display text-2xl tracking-wide text-white sm:gap-2.5 sm:text-[1.75rem]"
          >
            <BrandMark
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
              size={36}
              priority
            />
            <span className="hidden sm:inline">
              LEAGUE
              <span className="text-[var(--color-brand)]">SPORTS</span>
            </span>
          </Link>
          <div className="min-w-0 flex-1 lg:max-w-md xl:max-w-lg">
            <Suspense fallback={<NavbarSearchFallback />}>
              <NavbarSearch />
            </Suspense>
          </div>
          <HeaderSessionControls />
        </nav>
      </div>
    </header>
  );
}
