import { DeepLinkLand } from "@/components/conversion/DeepLinkLand";
import {
  mapVenueGallery,
  scoreboardHeroImage,
  type VenueGalleryImage,
} from "@/lib/venues/gallery";
import {
  scoreboardContactCells,
  type VenueContactLink,
} from "@/lib/venues/page-template";
import { isRemoteVenuePhoto, sanityImageUrl } from "@/lib/venues/photo";
import type { VenueDetail } from "@/services/venues";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { VenueFollowButton } from "./VenueFollowButton";

export type { VenueGalleryImage };
export { mapVenueGallery };

const ROW =
  "flex h-full min-h-12 min-w-0 items-center justify-center gap-1.5 border-y-2 border-r-2 px-2 font-display text-base uppercase tracking-wide transition-colors sm:gap-2 sm:px-3 sm:text-xl";
const CELL = `${ROW} border-[#333] bg-black text-white hover:border-[#C6FF00] hover:text-[#C6FF00]`;
const NEON_CELL = `${ROW} border-[#C6FF00] bg-[#C6FF00] text-black hover:bg-white`;

/** Section rhythm: ~20px on mobile, ~28px from the lg breakpoint. */
export function ScoreboardBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:space-y-7 lg:px-8 lg:py-7">
      {children}
    </div>
  );
}

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
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex justify-end">
          <span className="border-2 border-[#C6FF00] px-2 py-0.5 font-display text-sm tracking-[0.2em] text-[#C6FF00]">
            {mode === "watch" ? "WATCH" : "PLAY"}
          </span>
        </div>
        <h1 className="mt-3 font-display text-6xl uppercase leading-none tracking-wide text-white sm:text-7xl lg:text-8xl">
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
  venue: Pick<VenueDetail, "hero_image" | "gallery" | "sports">;
  stamp: "THE VENUE" | "THE CLUB";
}) {
  const source = scoreboardHeroImage(venue);
  const url = source
    ? sanityImageUrl(source, { width: 1600, height: 900 })
    : undefined;
  if (!url || !isRemoteVenuePhoto(url)) return null;

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
  const items = labels.map((label) => label.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <ul className="flex" aria-label="Amenities">
      {items.map((label, index) => (
        <li
          key={label}
          className={`flex min-h-12 min-w-0 flex-1 items-center justify-center border-y-2 border-r-2 border-[#333] px-2 py-3 text-center font-display text-lg uppercase tracking-wide text-white sm:text-xl ${
            index === 0 ? "border-l-2" : ""
          }`}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Flush strip under the Start bar. Only real cells, sharing the row. */
export function ScoreboardStats({
  count,
  setting,
  labels,
}: {
  count: string | null;
  setting: string | null;
  labels: string[];
}) {
  const amenities = labels.map((label) => label.trim()).filter(Boolean);
  if (!count && amenities.length === 0) return null;
  return (
    <div className="flex w-full bg-black">
      {count ? (
        <div className="flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center border-2 border-[#333] px-2 py-2">
          <p
            className="font-display text-5xl leading-none text-[#C6FF00] sm:text-6xl"
            style={{ textShadow: "0 0 14px #C6FF00" }}
          >
            {count}
          </p>
          {setting ? (
            <p className="mt-1 font-display text-sm uppercase tracking-[0.16em] text-white">
              {setting}
            </p>
          ) : null}
        </div>
      ) : null}
      {amenities.map((label, index) => (
        <div
          key={label}
          className={`flex min-h-16 min-w-0 flex-1 items-center justify-center border-y-2 border-r-2 border-[#333] px-2 py-3 text-center font-display text-lg uppercase tracking-wide text-white sm:text-xl ${
            count || index > 0 ? "" : "border-l-2"
          }`}
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
  const cells = scoreboardContactCells(links, Boolean(mapsUrl));
  const columns = cells.map((cell) => `minmax(0,${cell.weight}fr)`).join(" ");
  return (
    <div aria-label="Contact">
      <p className="font-display text-2xl uppercase tracking-[0.18em] text-[#C6FF00]">
        Contact
      </p>
      <div className="mt-3 grid" style={{ gridTemplateColumns: columns }}>
        {cells.map((cell, index) => {
          const edge = index === 0 ? "border-l-2" : "";
          if (cell.kind === "follow") {
            return (
              <VenueFollowButton
                key="follow"
                venueCmsId={venue._id}
                venueName={venue.name}
                venueSlug={venue.slug}
                appearance="scoreboard"
                className={`min-w-0 ${edge}`}
              />
            );
          }
          if (cell.kind === "directions") {
            return (
              <a
                key="directions"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${NEON_CELL} ${edge}`}
              >
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                Directions
              </a>
            );
          }
          const link = links.find((item) => item.kind === cell.kind);
          if (!link) return null;
          const external = link.kind === "website" || link.kind === "whatsapp";
          const Icon = contactIcon(link.kind);
          return (
            <a
              key={link.kind}
              href={link.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${CELL} ${edge}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {cell.label}
            </a>
          );
        })}
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
