const WHATSAPP_SHARE_ENDPOINT = "https://wa.me/?text=";

export type FixtureShareInput = {
  title: string;
  slug: string;
  origin: string;
};

export type FixtureWhatsAppShare = {
  text: string;
  pageUrl: string;
  href: string;
};

export function fixtureAbsoluteUrl(slug: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/events/${encodeURIComponent(slug)}`;
}

export function fixtureShareText(input: FixtureShareInput): string {
  const pageUrl = fixtureAbsoluteUrl(input.slug, input.origin);
  return `Watch ${input.title.trim()}\n${pageUrl}`;
}

export function fixtureWhatsAppHref(text: string): string {
  return `${WHATSAPP_SHARE_ENDPOINT}${encodeURIComponent(text)}`;
}

/** One-tap WhatsApp share. No phone number — `wa.me/?text=` opens the picker. */
export function buildFixtureWhatsAppShare(
  input: FixtureShareInput,
): FixtureWhatsAppShare {
  const text = fixtureShareText(input);
  return {
    text,
    pageUrl: fixtureAbsoluteUrl(input.slug, input.origin),
    href: fixtureWhatsAppHref(text),
  };
}
