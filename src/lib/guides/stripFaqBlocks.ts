import type { TypedObject } from "@portabletext/types";
import type { GuideFaq } from "../../data/guides/faqs.ts";

type PortableTextChild = {
  text?: unknown;
};

function blockStyle(block: TypedObject): string | undefined {
  if (!("style" in block) || typeof block.style !== "string") return undefined;
  return block.style;
}

function isHeadingBlock(block: TypedObject): boolean {
  if (block._type !== "block") return false;
  const style = blockStyle(block);
  return typeof style === "string" && /^h[1-6]$/.test(style);
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

/**
 * Drop Portable Text heading+answer blocks whose heading matches a
 * structured FAQ question, so the dedicated FAQ section is the only
 * visible copy.
 */
export function stripMatchingFaqBlocks(
  content: TypedObject[] | null | undefined,
  faqs: GuideFaq[],
): TypedObject[] {
  if (!content?.length) return content ?? [];
  if (!faqs.length) return content;

  const questions = new Set(
    faqs.map((faq) => normalizeFaqQuestion(faq.question)),
  );
  const hasMatchingQuestion = content.some(
    (block) =>
      isHeadingBlock(block) &&
      questions.has(normalizeFaqQuestion(blockPlainText(block))),
  );
  const result: TypedObject[] = [];

  for (let i = 0; i < content.length; i += 1) {
    const block = content[i];
    if (!isHeadingBlock(block)) {
      result.push(block);
      continue;
    }

    const heading = normalizeFaqQuestion(blockPlainText(block));
    const isFaqSectionHeading =
      hasMatchingQuestion && FAQ_SECTION_HEADINGS.has(heading);
    if (!questions.has(heading) && !isFaqSectionHeading) {
      result.push(block);
      continue;
    }

    while (i + 1 < content.length && !isHeadingBlock(content[i + 1])) {
      i += 1;
    }
  }

  return result;
}
