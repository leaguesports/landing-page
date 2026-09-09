import { ConversionKit } from "@/components/conversion/ConversionKit";
import { CtaPair } from "@/components/conversion/CtaPair";
import { selectCtaMatrix } from "@/lib/conversion/cta-matrix";
import { guideConversionIntent } from "@/lib/conversion/deep-links";
import { getGuideFaqs, type GuideFaq } from "@/data/guides/faqs";
import { normalizeGuideContent } from "@/lib/guides/portableText";
import {
  extractGuideTocHeadings,
  guideCtaSlot,
  guideHeadingIdMap,
  guideHeroVisual,
  guideSportFromText,
  splitGuideContentForInlineCta,
} from "@/lib/guides/presentation";
import { stripMatchingFaqBlocks } from "@/lib/guides/stripFaqBlocks";
import {
  safeSanityImageUrl,
  sanityImageAssetId,
} from "@/lib/sanity-image";
import { PortableText } from "next-sanity";
import type { Guide } from "../actions";
import { createGuidePortableTextComponents } from "../textComponents";
import { getGuideJsonLd } from "./guideJsonLd";
import { GuideHeroBand } from "./GuideHeroBand";
import { GuideToc } from "./GuideToc";

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
  const stripped =
    faqs.length > 0
      ? stripMatchingFaqBlocks(guide.content, faqs)
      : (guide.content ?? []);
  const content = normalizeGuideContent(stripped);
  const intent = guideConversionIntent(guide);
  const sport = guideSportFromText([
    guide.slug,
    guide.title,
    guide.description,
    ...(guide.keywords ?? []),
  ]);
  const imageUrl = safeSanityImageUrl(guide.mainImage, {
    width: 1920,
    height: 1080,
  });
  const visual = guideHeroVisual({ imageUrl, sport, intent });
  const headings = extractGuideTocHeadings(content);
  const headingIds = guideHeadingIdMap(headings);
  const { before, after } = splitGuideContentForInlineCta(content);
  const matrix = selectCtaMatrix({
    pageType: "guide",
    guideIntent: intent,
    sport,
    relatedHref: "/guides",
  });
  const tone = intent === "watch" ? "watch" : "play";
  const portableText = createGuidePortableTextComponents({
    intent,
    headingIds,
    skipImageAssetId: sanityImageAssetId(guide.mainImage),
  });
  const endSlot = guideCtaSlot("end");
  const midSlot = guideCtaSlot("mid");

  return (
    <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GuideHeroBand
        visual={visual}
        title={guide.title}
        description={guide.description}
        intent={intent}
        sport={sport}
        slug={guide.slug}
        matrix={matrix}
        mainImage={guide.mainImage}
      />

      <section
        id="content"
        className="scroll-mt-24 border-t border-white/5 py-12 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GuideToc headings={headings} />
          <PortableText value={before} components={portableText} />
          {after.length > 0 ? (
            <aside
              className="my-12 rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 sm:px-7 sm:py-7"
              data-cta-slot={midSlot}
            >
              <p
                className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] ${
                  intent === "watch" ? "text-sky-400" : "text-[var(--color-brand)]"
                }`}
              >
                {intent === "watch" ? "Find a screening" : "Play nearby"}
              </p>
              <CtaPair
                matrix={matrix}
                slot={midSlot}
                tone={tone}
                sport={sport}
                slug={guide.slug}
              />
            </aside>
          ) : null}
          {after.length > 0 ? (
            <PortableText value={after} components={portableText} />
          ) : null}
        </div>
      </section>

      <GuideFaqSection faqs={faqs} />

      <section className="relative overflow-hidden border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className={`pointer-events-none absolute inset-0 bg-linear-to-br ${
            intent === "watch"
              ? "from-sky-950/30 via-[#0c0f0c] to-[#0c0f0c]"
              : "from-emerald-950/30 via-[#0c0f0c] to-[#0c0f0c]"
          }`}
        />
        <div
          className={`pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl ${
            intent === "watch" ? "bg-sky-400/8" : "bg-[var(--color-brand)]/8"
          }`}
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/8 bg-[#141814] p-8 sm:p-10">
            <p
              className={`mb-5 text-xs font-semibold uppercase tracking-[0.2em] ${
                intent === "watch" ? "text-sky-400" : "text-[var(--color-brand)]"
              }`}
            >
              Next step
            </p>
            <ConversionKit
              matrix={matrix}
              tone={tone}
              sport={sport}
              sourcePage={`/guides/${guide.slug}`}
              pageKey={`guide:${guide.slug}`}
              pageType="guide"
              slug={guide.slug}
              slot={endSlot}
              showSticky={false}
              showFallback
            />
          </div>
        </div>
      </section>
    </div>
  );
}
