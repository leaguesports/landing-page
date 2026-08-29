import { urlFor } from "@/sanity/client";
import {
  resolveVenueImage,
  VENUE_PLACEHOLDER_IMAGE,
  type Venue,
} from "@/services/venues";
import type { SanityImageSource } from "@sanity/image-url";

export { VENUE_PLACEHOLDER_IMAGE };

export type VenuePhotoSource = Pick<Venue, "hero_image" | "sports">;

export function sanityImageUrl(
  source: SanityImageSource | undefined,
  size?: { width: number; height: number },
): string | undefined {
  if (!source) return undefined;
  const builder = urlFor(source);
  if (!builder) return undefined;
  try {
    const sized = size
      ? builder.width(size.width).height(size.height).fit("crop")
      : builder.width(800);
    return sized.url() || undefined;
  } catch {
    return undefined;
  }
}

/** CMS photo (`hero_image`, then Play sport image) or the same-origin placeholder. */
export function venuePhotoUrl(
  venue: VenuePhotoSource,
  size?: { width: number; height: number },
): string {
  return (
    sanityImageUrl(resolveVenueImage(venue), size) ?? VENUE_PLACEHOLDER_IMAGE
  );
}

export function isRemoteVenuePhoto(src: string): boolean {
  return src.startsWith("https://");
}
