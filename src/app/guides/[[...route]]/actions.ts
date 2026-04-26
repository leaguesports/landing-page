import { sanityClient } from "@/sanity/client";
import type { TypedObject } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url";

export type Guide = {
  _id: string;
  title: string;
  mainImage: SanityImageSource;
  slug: string;
  description: string;
  content: TypedObject[];
};

export async function getTopGuides(limit: number = 4) {
  return sanityClient.fetch<Guide[]>(
    `*[_type == "guide"] | order(createdAt desc) [0...$limit] {
      _id,
      title,
      description,
      mainImage,
      "slug": slug.current,
    }`,
    { limit },
  );
}

export async function listGuides() {
  return sanityClient.fetch<Guide[]>(
    `*[_type == "guide"] {
      _id,
      title,
      description,
      mainImage,
      "slug": slug.current,
    }`,
  );
}

export async function getGuideBySlug(slug: string) {
  return sanityClient.fetch<Guide | null>(
    `*[_type == "guide" && slug.current == $slug][0] {
            _id,
            title,
            mainImage,
            "slug": slug.current,
            description,
            content,
        }`,
    { slug },
  );
}
