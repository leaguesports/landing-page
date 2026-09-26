import type { WatchGuideLink } from "@/lib/intent/watch-screenings";
import Link from "next/link";

/**
 * Below the venue list, above FAQ. Guides, sibling sport hubs, and claim.
 */
export function WatchCityFooter({
  relatedGuides,
  siblings,
}: {
  relatedGuides: WatchGuideLink[];
  siblings: { href: string; label: string }[];
}) {
  return (
    <section
      className="border-t border-white/5 px-4 py-12 sm:px-6 lg:px-8"
      data-watch-footer=""
    >
      <div className="mx-auto max-w-7xl space-y-10">
        {relatedGuides.length > 0 ? (
          <div data-watch-related-guides="">
            <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
              Related guides
            </h2>
            <ul className="mt-4 space-y-2">
              {relatedGuides.map((guide) => (
                <li key={guide.href}>
                  <Link
                    href={guide.href}
                    className="text-sm font-medium text-emerald-300 hover:text-white"
                  >
                    {guide.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {siblings.length > 0 ? (
          <div data-watch-sibling-sports="">
            <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
              Other sports
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {siblings.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p>
          <Link
            href="/claim"
            className="text-sm font-medium text-emerald-300 hover:text-white"
          >
            List your venue
          </Link>
        </p>
      </div>
    </section>
  );
}
