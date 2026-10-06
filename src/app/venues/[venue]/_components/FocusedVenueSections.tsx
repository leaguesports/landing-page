import { BrandMark } from "@/components/BrandMark";
import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import {
  mapVenueGallery,
  type VenueGalleryImage,
} from "@/lib/venues/gallery";
import { type VenueContactLink } from "@/lib/venues/page-template";
import { isRemoteVenuePhoto, sanityImageUrl, venuePhotoUrl } from "@/lib/venues/photo";
import type { VenueDetail } from "@/services/venues";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { VenueFollowButton } from "./VenueFollowButton";

export type { VenueGalleryImage };
export { mapVenueGallery };

const CELL =
  "flex min-h-14 items-center justify-center gap-2 border-2 border-[#333] bg-black px-3 font-display text-xl uppercase tracking-wide text-white transition-colors hover:border-[#C6FF00] hover:text-[#C6FF00]";

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
      <div className="min-h-screen bg-[#0B0B0B] pb-16 text-white">{children}</div>
    </div>
  );
}

export function ScoreboardBand({
  mode,
  name,
  place,
}: {
  mode: "watch" | "play";
  name: string;
  place: string;
}) {
  return (
    <header className="bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandMark className="h-8 w-8" size={32} />
            <span className="font-display text-2xl tracking-wide text-white">
              LEAGUE<span className="text-[#C6FF00]">SPORTS</span>
            </span>
          </Link>
          <span className="border-2 border-[#C6FF00] px-2 py-0.5 font-display text-sm tracking-[0.2em] text-[#C6FF00]">
            {mode === "watch" ? "WATCH" : "PLAY"}
          </span>
        </div>
        <h1 className="mt-5 font-display text-6xl uppercase leading-none tracking-wide text-white sm:text-7xl lg:text-8xl">
          {name}
        </h1>
        {place ? (
          <p className="mt-3 font-display text-xl uppercase tracking-[0.22em] text-[#C6FF00]">
            {place}
          </p>
        ) : null}
      </div>
      <div className="h-1.5 bg-[#C6FF00]" />
    </header>
  );
}

/** Photo frame with a hard stamp. Omitted entirely when there is no photo. */
export function ScoreboardPhoto({
  venue,
  stamp,
}: {
  venue: Pick<VenueDetail, "hero_image" | "sports">;
  stamp: "THE VENUE" | "THE CLUB";
}) {
  const url = venuePhotoUrl(venue, { width: 1600, height: 900 });
  if (!isRemoteVenuePhoto(url)) return null;

  return (
    <figure className="relative border-2 border-[#333] bg-black">
      <div className="relative aspect-[16/9]">
        <Image src={url} alt="" fill priority className="object-cover" sizes="100vw" />
      </div>
      <figcaption className="absolute bottom-0 left-0 border-r-2 border-t-2 border-[#C6FF00] bg-black px-3 py-1 font-display text-lg tracking-[0.16em] text-[#C6FF00]">
        {stamp}
      </figcaption>
    </figure>
  );
}

export function ScoreboardAmenities({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3" aria-label="Good for">
      {labels.map((label) => (
        <li
          key={label}
          className="border-2 border-[#1D1D1D] px-3 py-4 text-center font-display text-xl uppercase tracking-wide text-white"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

export function ScoreboardStats({
  count,
  caption,
  labels,
}: {
  count: string | null;
  caption: string | null;
  labels: string[];
}) {
  if (!count && labels.length === 0) return null;
  return (
    <div className="grid grid-cols-2 border-2 border-[#333] sm:grid-cols-4">
      {count ? (
        <div className="border-2 border-[#333] px-4 py-4">
          <p
            className="font-display text-6xl leading-none text-[#C6FF00]"
            style={{ textShadow: "0 0 14px #C6FF00" }}
          >
            {count}
          </p>
          {caption ? (
            <p className="mt-2 font-display text-sm uppercase tracking-[0.16em] text-white">
              {caption}
            </p>
          ) : null}
        </div>
      ) : null}
      {labels.map((label) => (
        <div
          key={label}
          className="flex items-center justify-center border-2 border-[#333] px-3 py-4 text-center font-display text-xl uppercase tracking-wide text-white"
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function contactIcon(kind: VenueContactLink["kind"]) {
  if (kind === "phone") return Phone;
  if (kind === "whatsapp") return MessageCircle;
  if (kind === "email") return Mail;
  return Globe;
}

export function ScoreboardContact({
  venue,
  links,
  mapsUrl,
}: {
  venue: Pick<VenueDetail, "_id" | "name" | "slug">;
  links: VenueContactLink[];
  mapsUrl: string;
}) {
  return (
    <div aria-label="Contact">
      <p className="font-display text-2xl uppercase tracking-[0.18em] text-[#C6FF00]">
        Contact
      </p>
      <div className="mt-4 grid grid-cols-2">
        {links.map((link) => {
          const external = link.kind === "website" || link.kind === "whatsapp";
          const Icon = contactIcon(link.kind);
          return (
            <a
              key={link.kind}
              href={link.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={CELL}
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
            className={CELL}
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            Directions
          </a>
        ) : null}
      </div>
      <div className="mt-3">
        <VenueFollowButton
          venueCmsId={venue._id}
          venueName={venue.name}
          venueSlug={venue.slug}
          appearance="scoreboard"
        />
      </div>
    </div>
  );
}

export function ScoreboardAbout({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="text-sm leading-relaxed text-[#C8C8C8] sm:text-base">{text}</p>;
}

/** Horizontal snap strip. Renders nothing when there are no tiles. */
export function ScoreboardGallery({ images }: { images: VenueGalleryImage[] }) {
  const tiles = images
    .map((item) => {
      const url = sanityImageUrl(item.image, { width: 960, height: 720 });
      if (!url || !isRemoteVenuePhoto(url)) return null;
      return { ...item, url };
    })
    .filter((item): item is VenueGalleryImage & { url: string } => Boolean(item));
  if (tiles.length === 0) return null;

  return (
    <section aria-label="Gallery">
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="font-display text-3xl uppercase tracking-[0.18em] text-[#C6FF00]">
          Gallery
        </p>
        <span className="border-2 border-[#C6FF00] px-2 py-0.5 font-display text-sm tracking-widest text-[#C6FF00]">
          {tiles.length}
        </span>
      </div>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
        {tiles.map((tile) => (
          <figure
            key={`${tile.alt}-${tile.url}`}
            className="w-[78%] shrink-0 snap-start border-2 border-[#333] bg-black sm:w-[46%]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={tile.url}
                alt={tile.alt}
                fill
                className="object-cover"
                sizes="80vw"
              />
            </div>
            {tile.credit ? (
              <figcaption className="border-t-2 border-[#333] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#888]">
                {tile.credit}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
