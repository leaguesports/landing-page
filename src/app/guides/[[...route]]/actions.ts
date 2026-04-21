import { sanityClient } from "@/sanity/client";
import type { TypedObject } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url";

type Guide = {
  _id: string;
  title: string;
  mainImage: SanityImageSource;
  slug: string;
  description: string;
  content: TypedObject[];
};

export async function getGuideBySlug(slug: string) {
  return sanityClient.fetch<Guide | null>(
    `*[_type == "guide" && slug.current == $slug][0] {
            _id,
            title,
            mainImage,
            slug,
            description,
            content,
        }`,
    { slug },
  );
}
