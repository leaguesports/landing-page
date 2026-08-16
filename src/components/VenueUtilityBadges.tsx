import { Beer, MessageCircle, Phone, Tv, Volume2, Zap } from "lucide-react";
import type { ReactNode } from "react";

export type VenueUtilityFlags = {
  has_generator_backup?: boolean | null;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_craft_drafts?: boolean | null;
  phone?: string | null;
  website?: string | null;
};

function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // SA local 0XX… → 27XX…
  if (digits.startsWith("0") && digits.length >= 9) {
    return `27${digits.slice(1)}`;
  }
  return digits;
}

export function VenueUtilityBadges({
  venue,
  className = "",
}: {
  venue: VenueUtilityFlags;
  className?: string;
}) {
  const badges: { key: string; label: string; icon: ReactNode }[] = [];

  if (venue.has_generator_backup) {
    badges.push({
      key: "generator",
      label: "Generator / Inverter Backup",
      icon: <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />,
    });
  }
  if (venue.has_big_screens) {
    badges.push({
      key: "screens",
      label: "Big Screens",
      icon: <Tv className="h-3.5 w-3.5 shrink-0" aria-hidden />,
    });
  }
  if (venue.has_live_audio) {
    badges.push({
      key: "audio",
      label: "Live Audio",
      icon: <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden />,
    });
  }
  if (venue.has_craft_drafts) {
    badges.push({
      key: "drafts",
      label: "Craft Drafts",
      icon: <Beer className="h-3.5 w-3.5 shrink-0" aria-hidden />,
    });
  }

  if (badges.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <li
          key={badge.key}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
            badge.key === "generator"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-zinc-700 bg-zinc-900 text-zinc-300"
          }`}
        >
          {badge.key === "generator" ? (
            <>
              <span aria-hidden>⚡</span>
              {badge.label}
            </>
          ) : (
            <>
              {badge.icon}
              {badge.label}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export function VenueContactActions({
  venue,
  className = "",
}: {
  venue: VenueUtilityFlags;
  className?: string;
}) {
  const waPhone = venue.phone ? normalizePhoneForWhatsApp(venue.phone) : null;
  const waHref = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent("Hi from LeagueSports")}`
    : null;

  if (!waHref && !venue.phone && !venue.website) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#1ebe57]"
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
          WhatsApp Venue
        </a>
      )}
      {venue.phone && (
        <a
          href={`tel:${venue.phone}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden />
          Call
        </a>
      )}
      {venue.website && (
        <a
          href={venue.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
        >
          Website
        </a>
      )}
    </div>
  );
}
