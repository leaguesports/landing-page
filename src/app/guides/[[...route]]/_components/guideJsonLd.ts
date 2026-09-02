import type { GuideFaq } from "@/data/guides/faqs";
import { buildGuideJsonLd } from "@/lib/guides/guideJsonLd";
import { safeSanityImageUrl } from "@/lib/sanity-image";
import type { Guide } from "../actions";

export function getGuideJsonLd(guide: Guide, faqs: GuideFaq[]) {
  return buildGuideJsonLd({
    title: guide.title,
    description: guide.description,
    slug: guide.slug,
    imageUrl: safeSanityImageUrl(guide.mainImage),
    datePublished: guide._createdAt ?? undefined,
    faqs,
  });
}
