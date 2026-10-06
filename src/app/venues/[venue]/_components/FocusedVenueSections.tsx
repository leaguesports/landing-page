import { VenueUtilityBadges } from "@/components/VenueUtilityBadges";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import type { VenueGalleryImage } from "@/lib/venues/gallery";
import {
  venueAddressLine,
  type VenueContactLink,
} from "@/lib/venues/page-template";
import { isRemoteVenuePhoto, venuePhotoUrl } from "@/lib/venues/photo";
import type { VenueDetail } from "@/services/venues";
import {
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { VenueFollowButton } from "./VenueFollowButton";

const EYEBROW =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]";

const OUTLINE_PILL =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white hover:text-white";

const WHATSAPP_PILL =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#1ebe57]";

const CARD = "rounded-2xl border border-white/10 bg-[#141a17]";

export function FocusedVenueShell({
  template,
  slug,
  jsonLd,
  children,
}: {
  template: "watch" | "play";
  slug: string;
  jsonLd: unknown;
  children: ReactNode;
}) {
  return (
    <div data-venue-template={template}>
      <DeepLinkLand pageType="venue" slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#0c0f0c] pb-24 text-white">{children}</div>
    </div>
  );
}

export type { VenueGalleryImage };

/**
 * Same photo production uses: `hero_image`, then the first Play sport image
 * (`resolveVenueImage` via `venuePhotoUrl`). No separate venue `image` field.
 * A missing photo keeps the decorated hero — not the SVG placeholder.
 * A later gallery belongs in `after`. This pass does not render one.
 */
export function VenueHero({
  venue,
  name,
  place,
  after,
}: {
  venue: Pick<VenueDetail, "hero_image" | "sports" | "rating">;
  name: string;
  place: string;
  after?: ReactNode;
}) {
  const url = venuePhotoUrl(venue, { width: 1920, height: 1080 });
  const photo = isRemoteVenuePhoto(url) ? url : null;

  return (
    <section
      className={`relative overflow-hidden border-b border-white/5 ${photo ? "min-h-[28rem] sm:min-h-[34rem]" : ""}`}
      data-venue-hero
    >
      {photo ? (
        <>
          <Image
            src={photo}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0c0f0c] via-[#0c0f0c]/80 to-[#0c0f0c]/45" />
        </>
      ) : (
        <div
          className="pointer-events-none absolute -right-16 top-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
          aria-hidden
        />
      )}

      <div
        className={`relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 ${
          photo ? "flex min-h-[28rem] flex-col justify-end sm:min-h-[34rem]" : ""
        }`}
      >
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
          <Link href="/venues" className="transition-colors hover:text-white">
            Venues
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
          <span className="text-zinc-400">{name}</span>
        </nav>

        <p className={`mb-3 ${EYEBROW}`}>Venue</p>
        <h1 className="font-display text-5xl uppercase tracking-wide text-white sm:text-6xl lg:text-7xl">
          {name}
        </h1>

        {place || typeof venue.rating === "number" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {place ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand)]" />
                {place}
              </p>
            ) : null}
            {typeof venue.rating === "number" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-300" aria-hidden />
                {venue.rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        ) : null}
        {after}
      </div>
    </section>
  );
}

export function VenueColumns({
  main,
  aside,
}: {
  main: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-16 lg:px-8 lg:py-16">
      <div className="min-w-0 space-y-16">{main}</div>
      <div className="lg:sticky lg:top-28">{aside}</div>
    </div>
  );
}

export function VenueSection({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  card = true,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  card?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <header className="mb-6">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2
          id={`${id}-title`}
          className="mt-2 font-display text-3xl uppercase tracking-wide text-white sm:text-4xl"
        >
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-sm text-zinc-500">{subtitle}</p> : null}
      </header>
      {card ? <div className={`${CARD} p-5 sm:p-6`}>{children}</div> : children}
    </section>
  );
}

export function VenueAbout({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{text}</p>;
}

export function VenueAmenityPanel({
  venue,
  supportsWatch,
}: {
  venue: VenueDetail;
  supportsWatch: boolean;
}) {
  return <VenueUtilityBadges venue={venue} supportsWatch={supportsWatch} />;
}

export function VenueSportNames({
  sports,
}: {
  sports: { _id: string; name: string }[];
}) {
  if (sports.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {sports.map((sport) => (
        <li
          key={sport._id}
          className="inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-zinc-300"
        >
          {sport.name}
        </li>
      ))}
    </ul>
  );
}

/** Highlighted court or hole count. Not the sport name. */
export function VenueCourtFact({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <p className="inline-flex min-h-9 items-center rounded-full border border-emerald-400/50 bg-emerald-400/15 px-3 py-1.5 text-sm font-semibold text-emerald-200">
      {label}
    </p>
  );
}

function contactIcon(kind: VenueContactLink["kind"]) {
  if (kind === "phone") return Phone;
  if (kind === "whatsapp") return MessageCircle;
  if (kind === "email") return Mail;
  return Globe;
}

export function VenueActionCard({
  venue,
  links,
  mapsUrl,
}: {
  venue: Pick<VenueDetail, "_id" | "name" | "slug">;
  links: VenueContactLink[];
  mapsUrl: string;
}) {
  return (
    <aside className={`${CARD} p-5`} aria-label="Contact">
      <p className={EYEBROW}>Contact</p>
      <div className="mt-4 flex min-w-0 max-w-full flex-wrap gap-2">
        {links.map((link) => {
          const external = link.kind === "website" || link.kind === "whatsapp";
          const Icon = contactIcon(link.kind);
          return (
            <a
              key={link.kind}
              href={link.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={link.kind === "whatsapp" ? WHATSAPP_PILL : OUTLINE_PILL}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {link.label}
            </a>
          );
        })}
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={OUTLINE_PILL}
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            Directions
          </a>
        ) : null}
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <VenueFollowButton
          venueCmsId={venue._id}
          venueName={venue.name}
          venueSlug={venue.slug}
        />
      </div>
    </aside>
  );
}

/** Street address and directions. No embedded map. */
export function VenueLocation({
  name,
  venue,
  mapsUrl,
}: {
  name: string;
  venue: Pick<VenueDetail, "address">;
  mapsUrl: string;
}) {
  const line = venueAddressLine(venue.address);
  if (!line) return null;

  return (
    <>
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" />
        <div>
          <p className="font-display text-2xl uppercase leading-tight tracking-wide text-white">
            {name}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{line}</p>
        </div>
      </div>
      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${OUTLINE_PILL} mt-5`}
        >
          <MapPin className="h-4 w-4" />
          Directions
        </a>
      ) : null}
    </>
  );
}
