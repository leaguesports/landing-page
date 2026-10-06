import type { SanityImageSource } from "@sanity/image-url";

/**
 * Follow-up gallery on a venue page. Not read or rendered in this pass.
 * When it ships, render the images immediately after the hero via
 * `VenueSinglePhoto`'s `after` slot.
 */
export type VenueGalleryImage = {
  image: SanityImageSource;
  alt: string;
  credit?: string | null;
};
