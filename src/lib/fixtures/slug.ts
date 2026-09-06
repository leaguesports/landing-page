/** Fixture slug / Ably channel helpers shared by API routes. */

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const FIXTURE_CHANNEL_RE = /^fixture:([a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?)$/;

export function normalizeFixtureSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Rejects wildcards and oversized tokens before Ably capability minting. */
export function isValidFixtureSlug(raw: string): boolean {
  const slug = normalizeFixtureSlug(raw);
  if (slug.length < 1 || slug.length > 80) return false;
  if (slug.includes("*")) return false;
  return SLUG_RE.test(slug);
}

/**
 * Parse `fixture:<slug>` into a concrete channel name.
 * Returns null for wildcards (`fixture:*`, `fixture:foo*`) or invalid slugs.
 */
export function parseFixtureChannel(
  channel: string,
): { channel: string; slug: string } | null {
  const trimmed = channel.trim().toLowerCase();
  if (trimmed.includes("*")) return null;
  const match = trimmed.match(FIXTURE_CHANNEL_RE);
  if (!match?.[1] || !isValidFixtureSlug(match[1])) return null;
  return { channel: `fixture:${match[1]}`, slug: match[1] };
}

/** Only allow same-origin relative paths in feed CTAs (blocks phishing hrefs). */
export function isSafeRelativeHref(href: string | null | undefined): boolean {
  if (!href) return false;
  if (!href.startsWith("/")) return false;
  if (href.startsWith("//")) return false;
  if (href.includes("://")) return false;
  return true;
}
