/**
 * Publish / index bar for `/events/{slug}`.
 * A fixture is indexable only with unique intro, local angle, and 3–5 FAQs.
 * Word targets are ~80–120 (intro) and ~60–100 (local angle); we enforce
 * meaningful non-empty copy, not a character-perfect count.
 */

export const INDEX_INTRO_MIN_WORDS = 40;
export const INDEX_ANGLE_MIN_WORDS = 30;
export const INDEX_FAQ_MIN = 3;
export const INDEX_FAQ_MAX = 5;
export const INDEX_FAQ_QUESTION_MIN_WORDS = 3;
export const INDEX_FAQ_ANSWER_MIN_WORDS = 8;

export type FixtureFaqInput = {
  question?: unknown;
  answer?: unknown;
};

export type FixtureIndexInput = {
  seoIntro?: unknown;
  localAngle?: unknown;
  faqs?: unknown;
};

/** Flatten a string or Portable Text blocks into plain text. */
export function fixturePlainText(value: unknown): string {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }
  if (!Array.isArray(value)) return "";

  const parts: string[] = [];
  for (const block of value) {
    if (!block || typeof block !== "object") continue;
    const children = (block as { children?: unknown }).children;
    if (!Array.isArray(children)) continue;
    const text = children
      .map((child) => {
        if (!child || typeof child !== "object") return "";
        const node = child as { text?: unknown };
        return typeof node.text === "string" ? node.text : "";
      })
      .join("");
    if (text.trim()) parts.push(text.trim());
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function isMeaningfulText(
  value: unknown,
  minWords: number,
): boolean {
  const text = fixturePlainText(value);
  if (!text) return false;
  const lower = text.toLowerCase();
  if (lower === "tbd" || lower === "todo" || lower === "n/a" || lower === "lorem ipsum") {
    return false;
  }
  return wordCount(text) >= minWords;
}

export function completeFixtureFaqs(value: unknown): Array<{
  question: string;
  answer: string;
}> {
  if (!Array.isArray(value)) return [];
  const out: Array<{ question: string; answer: string }> = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as FixtureFaqInput;
    const question = fixturePlainText(row.question);
    const answer = fixturePlainText(row.answer);
    if (
      wordCount(question) < INDEX_FAQ_QUESTION_MIN_WORDS ||
      wordCount(answer) < INDEX_FAQ_ANSWER_MIN_WORDS
    ) {
      continue;
    }
    out.push({ question, answer });
  }
  return out;
}

export function isFixtureIndexable(input: FixtureIndexInput | null | undefined): boolean {
  if (!input) return false;
  if (!isMeaningfulText(input.seoIntro, INDEX_INTRO_MIN_WORDS)) return false;
  if (!isMeaningfulText(input.localAngle, INDEX_ANGLE_MIN_WORDS)) return false;
  const faqs = completeFixtureFaqs(input.faqs);
  return faqs.length >= INDEX_FAQ_MIN;
}

/** FAQs rendered on-page and in FAQPage JSON-LD (cap at 5). */
export function indexableFixtureFaqs(input: FixtureIndexInput | null | undefined): Array<{
  question: string;
  answer: string;
}> {
  return completeFixtureFaqs(input?.faqs).slice(0, INDEX_FAQ_MAX);
}
