/**
 * Watch vs Play venue CTAs (issue #119) — one helper, both templates.
 *
 * - Phone or WhatsApp in CMS (normalized digits) → green Inquire / Book via WhatsApp.
 * - No usable number → fallback in the contact row (never a dead button, never
 *   silent omission). Claimable listings get “Claim to add WhatsApp”; otherwise
 *   “WhatsApp not listed”. Directions / website stay as secondary actions.
 * - Claim Profile bar is independent and must remain.
 * - Empty-state copy must not say “via WhatsApp” when there is no number.
 */

export type VenueClaimStatus = "unclaimed" | "claim_pending" | "claimed";

export type VenueContactFields = {
  name?: string | null;
  slug?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  is_verified?: boolean | null;
  claim_status?: VenueClaimStatus | null;
};

export type VenueWhatsAppCta =
  | { kind: "whatsapp"; href: string; label: string }
  | { kind: "claim"; href: string; label: string }
  | { kind: "missing"; label: string };

const WHATSAPP_INQUIRE_LABEL = "Inquire / Book via WhatsApp";
const CLAIM_WHATSAPP_LABEL = "Claim to add WhatsApp";
const MISSING_WHATSAPP_LABEL = "WhatsApp not listed";

const SCREENING_EMPTY_WITH_WHATSAPP =
  "Live sports broadcast daily. Contact venue directly via WhatsApp to verify specific fixture broadcasts.";
const SCREENING_EMPTY_WITHOUT_WHATSAPP =
  "Live sports broadcast daily. Contact the venue directly to verify specific fixture broadcasts.";

/** Same claimability as the venue-page Claim Profile bar. */
export function isVenueClaimable(venue: {
  is_verified?: boolean | null;
  claim_status?: string | null;
}): boolean {
  return (
    venue.is_verified !== true &&
    venue.claim_status !== "claim_pending" &&
    venue.claim_status !== "claimed"
  );
}

/** Prefer dedicated WhatsApp, then phone — same as mapVenueRow. */
export function venueContactNumber(
  venue: Pick<VenueContactFields, "phone" | "whatsapp">,
): string | null {
  const raw = venue.whatsapp?.trim() || venue.phone?.trim() || "";
  return raw || null;
}

/**
 * Digits only for wa.me. SA local 0XX… → 27XX….
 * Returns null when the result is too short to be a real number (no broken button).
 */
export function normalizePhoneForWhatsApp(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized =
    digits.startsWith("0") && digits.length >= 9
      ? `27${digits.slice(1)}`
      : digits;
  if (normalized.length < 9) return null;
  return normalized;
}

export function buildVenueWhatsAppUrl(
  phone: string,
  venueName: string,
): string | null {
  const waPhone = normalizePhoneForWhatsApp(phone);
  if (!waPhone) return null;
  const name = venueName.trim() || "the venue";
  const text = `Hi ${name} team, I found your profile on League Sports and would like to inquire about...`;
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}

export function hasVenueWhatsAppContact(
  venue: Pick<VenueContactFields, "phone" | "whatsapp">,
): boolean {
  const raw = venueContactNumber(venue);
  return Boolean(raw && normalizePhoneForWhatsApp(raw));
}

export function resolveVenueWhatsAppCta(
  venue: VenueContactFields,
): VenueWhatsAppCta {
  const raw = venueContactNumber(venue);
  const href = raw
    ? buildVenueWhatsAppUrl(raw, venue.name?.trim() || "the venue")
    : null;
  if (href) {
    return { kind: "whatsapp", href, label: WHATSAPP_INQUIRE_LABEL };
  }

  const slug = venue.slug?.trim();
  if (slug && isVenueClaimable(venue)) {
    return {
      kind: "claim",
      href: `/claim?venue=${encodeURIComponent(slug)}`,
      label: CLAIM_WHATSAPP_LABEL,
    };
  }

  return { kind: "missing", label: MISSING_WHATSAPP_LABEL };
}

export function venueScreeningEmptyCopy(
  venue: Pick<VenueContactFields, "phone" | "whatsapp">,
): string {
  return hasVenueWhatsAppContact(venue)
    ? SCREENING_EMPTY_WITH_WHATSAPP
    : SCREENING_EMPTY_WITHOUT_WHATSAPP;
}
