import type { GuideFaq } from "../../data/guides/faqs.ts";

export const GUIDE_JSON_LD_SITE_URL = "https://leaguesports.co.za";

export type GuideJsonLdInput = {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
  datePublished: string;
  faqs?: GuideFaq[];
  siteUrl?: string;
};

type OrganizationJsonLd = {
  "@type": "Organization";
  name: "LeagueSports";
  url?: string;
  logo?: {
    "@type": "ImageObject";
    url: string;
  };
};

export type BlogPostingJsonLd = {
  "@type": "BlogPosting";
  headline: string;
  description: string;
  image?: string;
  author: OrganizationJsonLd;
  publisher: OrganizationJsonLd;
  datePublished: string;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
};

export type FaqPageJsonLd = {
  "@type": "FAQPage";
  "@id": string;
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
};

export type BreadcrumbListJsonLd = {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

export type GuideJsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": Array<BlogPostingJsonLd | FaqPageJsonLd | BreadcrumbListJsonLd>;
};

function toIsoDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function leagueSportsOrg(siteUrl: string, withLogo: boolean): OrganizationJsonLd {
  if (!withLogo) {
    return {
      "@type": "Organization",
      name: "LeagueSports",
      url: siteUrl,
    };
  }

  return {
    "@type": "Organization",
    name: "LeagueSports",
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
  };
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export function buildFaqPageJsonLd(
  faqs: GuideFaq[],
  pageUrl: string,
): FaqPageJsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: stripHtml(faq.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(faq.answer),
      },
    })),
  };
}

export function buildBlogPostingJsonLd(
  input: GuideJsonLdInput,
  pageUrl: string,
  siteUrl: string,
): BlogPostingJsonLd {
  const posting: BlogPostingJsonLd = {
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    author: leagueSportsOrg(siteUrl, false),
    publisher: leagueSportsOrg(siteUrl, true),
    datePublished: toIsoDate(input.datePublished),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };

  if (input.imageUrl) {
    posting.image = input.imageUrl;
  }

  return posting;
}

export function buildBreadcrumbListJsonLd(
  title: string,
  pageUrl: string,
  siteUrl: string,
): BreadcrumbListJsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${siteUrl}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };
}

export function buildGuideJsonLd(input: GuideJsonLdInput): GuideJsonLdGraph {
  const siteUrl = (input.siteUrl ?? GUIDE_JSON_LD_SITE_URL).replace(/\/$/, "");
  const pageUrl = `${siteUrl}/guides/${input.slug}`;
  const faqs = input.faqs ?? [];

  const graph: GuideJsonLdGraph["@graph"] = [
    buildBlogPostingJsonLd(input, pageUrl, siteUrl),
    buildBreadcrumbListJsonLd(input.title, pageUrl, siteUrl),
  ];

  if (faqs.length > 0) {
    graph.splice(1, 0, buildFaqPageJsonLd(faqs, pageUrl));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function findJsonLdNode<T extends GuideJsonLdGraph["@graph"][number]["@type"]>(
  jsonLd: GuideJsonLdGraph,
  type: T,
): Extract<GuideJsonLdGraph["@graph"][number], { "@type": T }> | undefined {
  return jsonLd["@graph"].find(
    (node): node is Extract<GuideJsonLdGraph["@graph"][number], { "@type": T }> =>
      node["@type"] === type,
  );
}
