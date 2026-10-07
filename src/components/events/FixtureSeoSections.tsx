import { FaqAnswerText } from "@/components/faq/FaqAnswerText";
import type { FixtureRelatedLink } from "@/lib/events/links";
import type { FixtureFaq } from "@/lib/sports/events-feed";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function FixtureIntroSection({
  id = "about",
  title,
  intro,
  localAngle,
}: {
  id?: string;
  title: string;
  intro: string | null;
  localAngle: string | null;
}) {
  if (!intro && !localAngle) return null;

  return (
    <section id={id} className="scroll-mt-40" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-display text-3xl tracking-wide text-zinc-950">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-zinc-700">
        {intro ? <p>{intro}</p> : null}
        {localAngle ? <p>{localAngle}</p> : null}
      </div>
    </section>
  );
}

export function FixtureFaqSection({
  id = "questions",
  title,
  faqs,
}: {
  id?: string;
  title: string;
  faqs: FixtureFaq[];
}) {
  if (faqs.length === 0) return null;

  return (
    <section id={id} className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-display text-3xl tracking-wide text-zinc-950">
        {title}
      </h2>
      <dl className="mt-4 space-y-3">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-zinc-200 px-4 py-4">
            <dt className="text-sm font-semibold text-zinc-950">{faq.question}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-zinc-600">
              <FaqAnswerText text={faq.answer} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FixtureInternalLinks({
  links,
  heading = "Keep exploring",
  allEventsHref = null,
}: {
  links: Array<FixtureRelatedLink & { description?: string }>;
  heading?: string;
  allEventsHref?: string | null;
}) {
  if (links.length === 0 && !allEventsHref) return null;

  return (
    <section id="more" className="mt-8 scroll-mt-40 border-t border-zinc-200 pt-8" aria-labelledby="more-title">
      {links.length > 0 ? (
        <>
          <h2 id="more-title" className="font-display text-3xl tracking-wide text-zinc-950">
            {heading}
          </h2>
          <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-emerald-800"
                >
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-zinc-950">{link.label}</span>
                    {link.description ? (
                      <span className="mt-0.5 block text-sm leading-relaxed text-zinc-600">
                        {link.description}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h2 id="more-title" className="sr-only">
          {heading}
        </h2>
      )}
      {allEventsHref ? (
        <p className={links.length > 0 ? "mt-4" : ""}>
          <Link href={allEventsHref} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
            All events
          </Link>
        </p>
      ) : null}
    </section>
  );
}
