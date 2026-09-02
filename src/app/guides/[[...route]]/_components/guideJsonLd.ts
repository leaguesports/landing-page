import { getGuideFaqs, type GuideFaq } from "@/data/guides/faqs";
import { buildGuideJsonLd } from "@/lib/guides/guideJsonLd";
import { urlFor } from "@/sanity/client";
import type { Guide } from "../actions";

export function getGuideJsonLd(
  guide: Guide,
  faqs: GuideFaq[] = getGuideFaqs(guide.slug),
) {
  return buildGuideJsonLd({
    title: guide.title,
    description: guide.description,
    slug: guide.slug,
    imageUrl: urlFor(guide.mainImage)?.url() ?? "",
    datePublished: guide._createdAt,
    faqs,
  });
}
