import type { TypedObject } from "@portabletext/types";
import {
  faqHeadingsToStrip,
  type GuideFaq,
} from "../../data/guides/faqs.ts";

type PortableTextChild = {
  text?: unknown;
};

function blockStyle(block: TypedObject): string | undefined {
  if (!("style" in block) || typeof block.style !== "string") return undefined;
  return block.style;
}

function headingLevel(block: TypedObject): number | null {
  const style = blockStyle(block);
  const match = style?.match(/^h([1-6])$/);
  return match ? Number(match[1]) : null;
}

function isHeadingBlock(block: TypedObject): boolean {
  return headingLevel(block) !== null && block._type === "block";
}

function blockPlainText(block: TypedObject): string {
  if (!("children" in block) || !Array.isArray(block.children)) return "";

  return block.children
    .map((child) => {
      if (!child || typeof child !== "object") return "";
      const text = (child as PortableTextChild).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

/** Normalize heading/question text so curly quotes and spacing still match. */
export function normalizeFaqQuestion(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const FAQ_SECTION_HEADINGS = new Set(
  ["faq", "faqs", "frequently asked questions"].map(normalizeFaqQuestion),
);

function isClosingCtaHeading(text: string): boolean {
  return /^ready to\b/i.test(text.trim());
}

/**
 * Drop Portable Text heading+answer blocks whose heading matches a
 * structured FAQ question, so the dedicated FAQ section is the only
 * visible copy. Also drops a wrapping "FAQ" heading and the rest of
 * that section until the next same-level heading or a "Ready to…" CTA.
 */
export function stripMatchingFaqBlocks(
  content: TypedObject[] | null | undefined,
  faqs: GuideFaq[],
): TypedObject[] {
  if (!content?.length) return content ?? [];
  if (!faqs.length) return content;

  const questions = new Set(
    faqHeadingsToStrip(faqs).map((heading) => normalizeFaqQuestion(heading)),
  );
  const result: TypedObject[] = [];

  for (let i = 0; i < content.length; i += 1) {
    const block = content[i];
    if (!isHeadingBlock(block)) {
      result.push(block);
      continue;
    }

    const headingText = blockPlainText(block);
    const heading = normalizeFaqQuestion(headingText);
    const isFaqSectionHeading = FAQ_SECTION_HEADINGS.has(heading);
    const isFaqQuestion = questions.has(heading);

    if (!isFaqQuestion && !isFaqSectionHeading) {
      result.push(block);
      continue;
    }

    if (isFaqSectionHeading) {
      const sectionLevel = headingLevel(block) ?? 2;
      while (i + 1 < content.length) {
        const next = content[i + 1];
        if (isHeadingBlock(next)) {
          const nextText = blockPlainText(next);
          const nextLevel = headingLevel(next) ?? 6;
          if (isClosingCtaHeading(nextText)) break;
          if (
            nextLevel <= sectionLevel &&
            !FAQ_SECTION_HEADINGS.has(normalizeFaqQuestion(nextText))
          ) {
            break;
          }
        }
        i += 1;
      }
      continue;
    }

    while (i + 1 < content.length && !isHeadingBlock(content[i + 1])) {
      i += 1;
    }
  }

  return result;
}
