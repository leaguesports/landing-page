/**
 * Visible About copy on a venue page.
 *
 * Sanity blocks stay paragraphs. Booking, price, contact, and URL lines stay.
 * A sentence is removed only when it is an editorial publish note.
 * Meta descriptions do not use this helper.
 */

/** Collapse the About preview once the copy is longer than a short blurb. */
export const VENUE_ABOUT_EXPAND_CHARS = 400;

/**
 * Editorial leftovers written into a description. Does not match Playtomic,
 * phones, prices, or plain URLs — those are customer copy.
 */
const EDITORIAL_NOTE =
  /internal note|publish note|do not publish|(?:^|\b)at publish\b/i;

type PortableSpan = { text?: string | null };
type PortableBlock = { children?: PortableSpan[] | null };

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function blockText(block: unknown): string {
  if (!block || typeof block !== "object") return "";
  const children = (block as PortableBlock).children;
  if (!Array.isArray(children)) return "";
  return children
    .map((span) => (typeof span?.text === "string" ? span.text : ""))
    .join("");
}

/** One paragraph, with editorial sentences removed and the rest left intact. */
function paragraphText(raw: string): string {
  const normalized = raw.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const parts = sentences(normalized);
  const kept = parts.filter((sentence) => !EDITORIAL_NOTE.test(sentence));
  if (kept.length === parts.length) return normalized;
  return kept.join(" ").trim();
}

/**
 * About paragraphs in source order.
 * A string splits on newlines. Portable Text keeps one paragraph per block.
 */
export function venueAboutParagraphs(description: unknown): string[] {
  if (typeof description === "string") {
    return description
      .split(/\n+/)
      .map((part) => paragraphText(part))
      .filter(Boolean);
  }
  if (!Array.isArray(description)) return [];
  return description
    .map((block) => paragraphText(blockText(block)))
    .filter(Boolean);
}

export function venueAboutExpands(paragraphs: readonly string[]): boolean {
  const text = paragraphs.join(" ").replace(/\s+/g, " ").trim();
  return text.length > VENUE_ABOUT_EXPAND_CHARS;
}
