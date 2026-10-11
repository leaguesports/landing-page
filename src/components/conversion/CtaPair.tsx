"use client";

import { track } from "@/lib/analytics/track";
import type { CtaSlot } from "@/lib/analytics/track";
import {
  ctaAnalyticsParams,
  distinctMatrixCtas,
  type ConversionCta,
  type CtaMatrix,
} from "@/lib/conversion/cta-matrix";
import Link from "next/link";

export type CtaPairTone = "play" | "watch";

const PRIMARY_CLASS: Record<CtaPairTone, string> = {
  play: "inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300",
  watch:
    "inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white",
};

const SECONDARY_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950";

const LIGHT_PRIMARY =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800";
const LIGHT_SECONDARY =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-950";

function isExternal(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

export function ConversionCtaLink({
  cta,
  matrix,
  slot,
  tone,
  variant,
  sport,
  city,
  slug,
  className,
}: {
  cta: ConversionCta;
  matrix: CtaMatrix;
  slot: CtaSlot;
  tone: CtaPairTone;
  variant: "primary" | "secondary";
  sport?: string | null;
  city?: string | null;
  slug?: string | null;
  className?: string;
}) {
  const href = cta.href || "#";
  const classes =
    className ?? (variant === "primary" ? PRIMARY_CLASS[tone] : SECONDARY_CLASS);

  function onClick() {
    track("cta_click", {
      ...ctaAnalyticsParams(matrix, slot, { sport, city, slug }),
      cta_id: cta.id,
    });
    if (cta.id === "share_event" || cta.id === "whatsapp") {
      track("share_click", {
        ...ctaAnalyticsParams(matrix, slot, { sport, city, slug }),
        channel: "whatsapp",
      });
    }
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
      >
        {cta.label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={classes}>
      {cta.label}
    </Link>
  );
}

export function CtaPair({
  matrix,
  slot = "hero",
  tone = "play",
  sport,
  city,
  slug,
  className = "",
  surface = "dark",
}: {
  matrix: CtaMatrix;
  slot?: CtaSlot;
  tone?: CtaPairTone;
  sport?: string | null;
  city?: string | null;
  slug?: string | null;
  className?: string;
  /** Light pages use the same filled and outline buttons as venue profiles. */
  surface?: "dark" | "light";
}) {
  const ctas = distinctMatrixCtas(matrix);

  return (
    <div className={`flex flex-wrap gap-3 ${className}`.trim()}>
      {ctas.map((cta, index) => {
        const variant = index === 0 ? "primary" : "secondary";
        return (
          <ConversionCtaLink
            key={`${cta.id}-${index}`}
            cta={cta}
            matrix={matrix}
            slot={slot}
            tone={tone}
            variant={variant}
            sport={sport}
            city={city}
            slug={slug}
            className={
              surface === "light"
                ? variant === "primary"
                  ? LIGHT_PRIMARY
                  : LIGHT_SECONDARY
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
