import { urlFor } from "@/sanity/client";
import type { Guide } from "../actions";

export function getGuideJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "Guide",
    headline: guide.title,
    description: guide.description,
    image: urlFor(guide.mainImage)?.url() ?? "",
    author: {
      "@type": "Organization",
      name: "LeagueSports",
      url: "https://leaguesports.co.za",
    },
    publisher: {
      "@type": "Organization",
      name: "LeagueSports",
      logo: {
        "@type": "ImageObject",
        url: "https://leaguesports.co.za/logo.png",
      },
    },
    datePublished: new Date(guide._createdAt).toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://leaguesports.co.za/guides/${guide.slug}`,
    },
  };
}
