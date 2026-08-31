import { sanityClient } from "@/sanity/client";
import type { TypedObject } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url";

export type Guide = {
  _id: string;
  _createdAt: string;
  title: string;
  mainImage: SanityImageSource;
  slug: string;
  description: string;
  keywords: string[];
  content: TypedObject[];
};

export async function getTopGuides(limit: number = 4) {
  return sanityClient.fetch<Guide[]>(
    `*[_type == "guide"] | order(_createdAt desc) [0...$limit] {
      _id,
      _createdAt,
      title,
      description,
      mainImage,
      "slug": slug.current,
      keywords,
    }`,
    { limit },
  );
}

export async function listGuides() {
  return sanityClient.fetch<Guide[]>(
    `*[_type == "guide"] | order(_createdAt desc) {
      _id,
      _createdAt,
      title,
      description,
      mainImage,
      "slug": slug.current,
      keywords,
    }`,
  );
}

export async function getGuideBySlug(slug: string) {
  return sanityClient.fetch<Guide | null>(
    `*[_type == "guide" && slug.current == $slug][0] {
            _id,
            title,
            _createdAt,
            mainImage,
            "slug": slug.current,
            description,
            content,
            keywords,
        }`,
    { slug },
  );
}
