export type FaqAnswerPart =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Internal paths and the production site only — FAQ copy must not become an open redirect. */
export function isSafeFaqHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")) {
    return true;
  }
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "leaguesports.co.za";
  } catch {
    return false;
  }
}

/**
 * Split a FAQ answer into text and markdown links: [label](/path).
 * Unsafe targets stay as literal text.
 */
export function parseFaqAnswer(answer: string): FaqAnswerPart[] {
  const parts: FaqAnswerPart[] = [];
  let last = 0;

  for (const match of answer.matchAll(MARKDOWN_LINK)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ type: "text", text: answer.slice(last, index) });
    }
    const label = match[1] ?? "";
    const href = match[2] ?? "";
    if (label && isSafeFaqHref(href)) {
      parts.push({ type: "link", text: label, href });
    } else {
      parts.push({ type: "text", text: match[0] });
    }
    last = index + match[0].length;
  }

  if (last < answer.length) {
    parts.push({ type: "text", text: answer.slice(last) });
  }
  if (parts.length === 0) {
    parts.push({ type: "text", text: answer });
  }
  return parts;
}

/** Answer text for FAQPage JSON-LD: link labels only, HTML stripped. */
export function faqAnswerPlainText(answer: string): string {
  return parseFaqAnswer(answer)
    .map((part) => part.text)
    .join("")
    .replace(/<[^>]*>/g, "")
    .trim();
}
