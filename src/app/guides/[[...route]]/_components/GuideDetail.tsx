import { getGuideFaqs, type GuideFaq } from "@/data/guides/faqs";
import { stripMatchingFaqBlocks } from "@/lib/guides/stripFaqBlocks";
import { urlFor } from "@/sanity/client";
import { Bell, Flag } from "lucide-react";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import type { Guide } from "../actions";
import { guidePortableTextComponents } from "../textComponents";
import { getGuideJsonLd } from "./guideJsonLd";

function GuideFaqSection({ faqs }: { faqs: GuideFaq[] }) {
  if (faqs.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="guide-faq-heading"
      className="scroll-mt-24 border-t border-white/5 py-12 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="guide-faq-heading"
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
              <p className="text-balance text-base font-medium leading-[1.75] text-zinc-300 sm:text-lg">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GuideDetail({ guide }: { guide: Guide }) {
  const faqs = getGuideFaqs(guide.slug);
  const jsonLd = getGuideJsonLd(guide, faqs);
  const content =
    faqs.length > 0
      ? stripMatchingFaqBlocks(guide.content, faqs)
      : guide.content;

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/40 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Guide
          </p>
          <h1 className="font-display text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
            {guide.title}
          </h1>
          {guide.description ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {guide.description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#141814]">
            <div className="aspect-21/9 w-full sm:aspect-[2.4/1]">
              <Image
                src={urlFor(guide.mainImage)?.url() ?? ""}
                alt={guide.title}
                width={1500}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="content"
        className="scroll-mt-24 border-t border-white/5 py-12 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PortableText
            value={content}
            components={guidePortableTextComponents}
          />
        </div>
      </section>

      <GuideFaqSection faqs={faqs} />

      <section className="relative overflow-hidden border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-950/30 via-[#0c0f0c] to-[#0c0f0c]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[var(--color-brand)]/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-white/8 bg-[#141814] p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Flag className="h-5 w-5 text-[var(--color-brand)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                  Stay in the loop
                </span>
              </div>
              <h2 className="mb-3 font-display text-4xl tracking-wide text-white sm:text-5xl">
                More <span className="text-[var(--color-brand)]">venues</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-zinc-400">
                Discover screenings, fan zones, and places to play near you.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
              <Link
                href="/guides"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
              >
                Browse all guides
              </Link>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950"
              >
                <Bell className="h-4 w-4" />
                Guide alerts
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
