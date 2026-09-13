import type { FixtureRelatedLink } from "@/lib/events/links";
import type { FixtureFaq } from "@/lib/sports/events-feed";
import Link from "next/link";

export function FixtureIntroSection({
  intro,
  localAngle,
}: {
  intro: string | null;
  localAngle: string | null;
}) {
  if (!intro && !localAngle) return null;

  return (
    <section className="border-b border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
        {intro ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              The fixture
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Why it matters
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
              {intro}
            </p>
          </div>
        ) : null}
        {localAngle ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Local angle
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              Where it lands
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
              {localAngle}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function FixtureFaqSection({ faqs }: { faqs: FixtureFaq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="fixture-faq-heading"
      className="scroll-mt-24 border-b border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="fixture-faq-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]"
        >
          Frequently asked questions
        </h2>
        <div>
          {faqs.map((faq) => (
            <article key={faq.question} className="mt-10 first:mt-6">
              <h3 className="mb-3 font-display text-2xl tracking-wide text-white sm:text-3xl">
                {faq.question}
              </h3>
              <p className="text-base font-medium leading-[1.75] text-zinc-300 sm:text-lg">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FixtureInternalLinks({
  links,
  heading = "Keep exploring",
  allEventsHref = null,
}: {
  links: FixtureRelatedLink[];
  heading?: string;
  allEventsHref?: string | null;
}) {
  if (links.length === 0 && !allEventsHref) return null;

  return (
    <section className="border-b border-white/5 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {links.length > 0 ? (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Related
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
              {heading}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {allEventsHref ? (
          <p className={links.length > 0 ? "mt-6" : ""}>
            <Link
              href={allEventsHref}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              All events
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
