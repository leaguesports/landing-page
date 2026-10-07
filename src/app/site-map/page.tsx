import { sitemapSections, SITEMAP_PAGE_LINK } from "@/lib/seo/sitelinks";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: SITEMAP_PAGE_LINK.title,
  description: SITEMAP_PAGE_LINK.description,
  alternates: { canonical: SITEMAP_PAGE_LINK.href },
};

export default function SiteMapPage() {
  const sections = sitemapSections();

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="font-display text-5xl tracking-wide sm:text-6xl">Site Map</h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          {SITEMAP_PAGE_LINK.description}
        </p>

        <div className="mt-12 space-y-12">
          {sections.map((section) => (
            <section key={section.heading} aria-labelledby={`sitemap-${section.heading}`}>
              <h2
                id={`sitemap-${section.heading}`}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500"
              >
                {section.heading}
              </h2>
              <ul className="mt-4 divide-y divide-white/8 border-y border-white/8">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="block py-4 transition-colors hover:text-[var(--color-brand)]">
                      <span className="block text-base font-semibold text-white">{link.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                        {link.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
