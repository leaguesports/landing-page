import { ConversionKit } from "@/components/conversion/ConversionKit";
import type { CtaPairTone } from "@/components/conversion/CtaPair";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import {
  guideCtaSlot,
  type GuideHeroVisual,
  type GuideIntent,
} from "@/lib/guides/presentation";
import { sanityHotspotObjectPosition } from "@/lib/sanity-image";
import Image from "next/image";

export function GuideHeroBand({
  visual,
  title,
  description,
  intent,
  sport,
  slug,
  matrix,
  mainImage,
}: {
  visual: GuideHeroVisual;
  title: string;
  description?: string | null;
  intent: GuideIntent;
  sport: string | null;
  slug: string;
  matrix: CtaMatrix;
  mainImage?: unknown;
}) {
  const tone: CtaPairTone = intent === "watch" ? "watch" : "play";
  const accent =
    intent === "watch" ? "text-sky-400" : "text-[var(--color-brand)]";
  const sportLabel = sport
    ? sport.charAt(0).toUpperCase() + sport.slice(1)
    : null;
  const eyebrow = [sportLabel, intent === "watch" ? "Watch guide" : "Play guide"]
    .filter(Boolean)
    .join(" · ");
  const objectPosition =
    visual.kind === "image" ? sanityHotspotObjectPosition(mainImage) : undefined;

  return (
    <section
      className="relative isolate overflow-hidden border-b border-white/5"
      data-guide-hero={visual.kind}
    >
      <div className="absolute inset-0" aria-hidden>
        {visual.kind === "image" ? (
          <Image
            src={visual.src}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            style={objectPosition ? { objectPosition } : undefined}
          />
        ) : (
          <>
            <div className={`absolute inset-0 bg-linear-to-br ${visual.wash}`} />
            <div
              className={`absolute inset-0 ${visual.patternClassName} opacity-50`}
            />
            <div
              className={`pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full ${visual.glow} blur-3xl`}
            />
          </>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0c0f0c] via-[#0c0f0c]/72 to-[#0c0f0c]/35" />
      </div>

      <div className="relative mx-auto flex min-h-[56vh] max-w-7xl flex-col justify-end px-4 py-16 sm:min-h-[60vh] sm:px-6 sm:py-20 lg:min-h-[65vh] lg:px-8">
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}
        >
          {eyebrow}
        </p>
        <h1 className="font-display max-w-4xl text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-8">
          <ConversionKit
            matrix={matrix}
            tone={tone}
            sport={sport}
            sourcePage={`/guides/${slug}`}
            pageKey={`guide:${slug}`}
            pageType="guide"
            slug={slug}
            slot={guideCtaSlot("hero")}
            showSticky
            showFallback={false}
          />
        </div>
      </div>
    </section>
  );
}
