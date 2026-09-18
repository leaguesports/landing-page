import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import type { VenueDetail } from "@/services/venues";

export const venueAboutPortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 text-balance text-base font-medium leading-[1.75] text-zinc-300 last:mb-0 sm:text-lg">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h3 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)] first:mt-0">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-zinc-400 first:mt-0">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-[var(--color-brand)]/70 py-1 pl-5 text-base italic leading-relaxed text-zinc-400 sm:text-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 space-y-4 sm:my-8">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-3 pl-5 text-zinc-300 marker:font-semibold marker:text-[var(--color-brand)] sm:my-8 sm:pl-6">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex gap-3.5 text-base font-medium leading-[1.65] text-zinc-300 sm:text-lg">
        <span
          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]"
          aria-hidden
        />
        <span className="min-w-0 flex-1 [&_strong]:text-white">{children}</span>
      </li>
    ),
    number: ({ children }) => (
      <li className="text-base font-medium leading-relaxed text-zinc-300 sm:text-lg [&_strong]:text-white">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
    link: ({ children, value }) => {
      const href =
        value && typeof value === "object" && "href" in value
          ? String((value as { href?: string }).href ?? "#")
          : "#";
      return (
        <Link
          href={href}
          className="font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand)]/35 underline-offset-[3px] transition-colors hover:text-[var(--color-brand-dim)]"
        >
          {children}
        </Link>
      );
    },
  },
} satisfies PortableTextComponents;

export function VenueAboutSection({ venue }: { venue: VenueDetail }) {
  return (
    <section
      id="about"
      className="scroll-mt-28 border-t border-white/5 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            About
          </p>
          <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
            {venue.name}
          </h2>
        </header>
        <div className="rounded-3xl border border-white/8 bg-[#141814] p-6 sm:p-8">
          <PortableText
            value={venue.description}
            components={venueAboutPortableTextComponents}
          />
        </div>
      </div>
    </section>
  );
}
