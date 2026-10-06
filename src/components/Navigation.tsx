import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import HeaderSessionControls from "@/components/HeaderSessionControls";
import { HEADER_SITELINKS } from "@/lib/seo/sitelinks";

function SectionLinks({
  className,
  linkClassName,
}: {
  className: string;
  linkClassName: string;
}) {
  return (
    <ul className={className}>
      {HEADER_SITELINKS.map((link) => (
        <li key={link.href} className="shrink-0">
          <Link href={link.href} className={linkClassName}>
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

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
            className="inline-flex items-center gap-2 font-display text-2xl tracking-wide text-white sm:gap-2.5 sm:text-[1.75rem]"
          >
            <BrandMark
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              size={40}
              priority
            />
            <span>
              LEAGUE
              <span className="text-[var(--color-brand)]">SPORTS</span>
            </span>
          </Link>
          <SectionLinks
            className="hidden min-w-0 items-center gap-5 lg:flex"
            linkClassName="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          />
          <HeaderSessionControls />
        </nav>
      </div>
    </header>
  );
}
