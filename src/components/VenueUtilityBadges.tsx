import {
  Beer,
  Car,
  Cigarette,
  Globe,
  MapPin,
  MessageCircle,
  Tv,
  UtensilsCrossed,
  Volume2,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

export type VenueUtilityFlags = {
  name?: string | null;
  has_generator_backup?: boolean | null;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_craft_drafts?: boolean | null;
  has_food_menu?: boolean | null;
  has_outdoor_area?: boolean | null;
  has_parking?: boolean | null;
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

function buildVenueWhatsAppUrl(
  phone: string,
  venueName: string,
): string | null {
  const waPhone = normalizePhoneForWhatsApp(phone);
  if (!waPhone) return null;
  const text = `Hi ${venueName} team, I found your profile on League Sports and would like to inquire about...`;
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}

type BadgeTone = "power" | "av" | "amenity";

type BadgeDef = {
  key: string;
  label: string;
  shortLabel: string;
  emoji: string;
  icon: ReactNode;
  tone: BadgeTone;
};

const TONE_CLASS: Record<BadgeTone, string> = {
  power:
    "border-amber-400/60 bg-amber-400 text-zinc-950 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]",
  av: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  amenity: "border-white/12 bg-white/5 text-zinc-300",
};

export function VenueUtilityBadges({
  venue,
  className = "",
  compact = false,
}: {
  venue: VenueUtilityFlags;
  className?: string;
  compact?: boolean;
}) {
  const badges: BadgeDef[] = [];

  if (venue.has_generator_backup) {
    badges.push({
      key: "generator",
      label: "Generator / Inverter Backup",
      shortLabel: "Generator",
      emoji: "⚡",
      icon: <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "power",
    });
  }
  if (venue.has_big_screens) {
    badges.push({
      key: "screens",
      label: "HD Big Screens",
      shortLabel: "Screens",
      emoji: "📺",
      icon: <Tv className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "av",
    });
  }
  if (venue.has_live_audio) {
    badges.push({
      key: "audio",
      label: "Live Commentary On",
      shortLabel: "Audio",
      emoji: "🔊",
      icon: <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "av",
    });
  }
  if (venue.has_craft_drafts) {
    badges.push({
      key: "drafts",
      label: "Draft Beer",
      shortLabel: "Drafts",
      emoji: "🍺",
      icon: <Beer className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "amenity",
    });
  }
  if (venue.has_food_menu) {
    badges.push({
      key: "food",
      label: "Food Menu",
      shortLabel: "Food",
      emoji: "🍔",
      icon: <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "amenity",
    });
  }
  if (venue.has_outdoor_area) {
    badges.push({
      key: "outdoor",
      label: "Outdoor Area",
      shortLabel: "Outdoor",
      emoji: "🚬",
      icon: <Cigarette className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "amenity",
    });
  }
  if (venue.has_parking) {
    badges.push({
      key: "parking",
      label: "On-site Parking",
      shortLabel: "Parking",
      emoji: "🚗",
      icon: <Car className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      tone: "amenity",
    });
  }

  if (badges.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Venue features">
      {badges.map((badge) => (
        <li
          key={badge.key}
          className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${
            compact
              ? `min-h-7 px-2.5 py-1 text-[10px] ${TONE_CLASS[badge.tone]}`
              : `min-h-9 px-3 py-1.5 text-[11px] ${TONE_CLASS[badge.tone]}`
          }`}
        >
          {compact ? badge.icon : <span aria-hidden>{badge.emoji}</span>}
          {compact ? badge.shortLabel : badge.label}
        </li>
      ))}
    </ul>
  );
}

export function VenueContactActions({
  venue,
  directionsUrl,
  className = "",
}: {
  venue: VenueUtilityFlags;
  directionsUrl?: string | null;
  className?: string;
}) {
  const venueName = venue.name?.trim() || "the venue";
  const waHref = venue.phone
    ? buildVenueWhatsAppUrl(venue.phone, venueName)
    : null;

  if (!waHref && !directionsUrl && !venue.website) return null;

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
          Inquire / Book via WhatsApp
        </a>
      )}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          Get Directions
        </a>
      )}
      {venue.website && (
        <a
          href={venue.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white"
        >
          <Globe className="h-4 w-4 shrink-0" aria-hidden />
          Official Website
        </a>
      )}
    </div>
  );
}
