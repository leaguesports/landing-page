import { getEventFaqs } from "../../data/events/faqs.ts";
import { completeFixtureFaqs, INDEX_FAQ_MAX } from "./index-bar.ts";

function normalizeFaqKey(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * FAQs for an event page: slug-keyed frontend copy first, then CMS FAQs.
 * A frontend question with the same wording replaces the CMS answer.
 * Capped at the index FAQ maximum so schema and the visible block match.
 */
export function resolveFixturePageFaqs(
  slug: string,
  cmsFaqs: unknown,
): Array<{ question: string; answer: string }> {
  const injected = completeFixtureFaqs(getEventFaqs(slug));
  const cms = completeFixtureFaqs(cmsFaqs);
  const replaced = new Set(injected.map((faq) => normalizeFaqKey(faq.question)));
  const merged = [
    ...injected,
    ...cms.filter((faq) => !replaced.has(normalizeFaqKey(faq.question))),
  ];
  return merged.slice(0, INDEX_FAQ_MAX);
}
