import { sanityClient } from "@/sanity/client";
import { SanityImageSource } from "@sanity/image-url";

export type Venue = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postcode: string;
    country: string;
  };
  sports: {
    _id: string;
    name: string;
    image: SanityImageSource | undefined;
  }[];
  broadcasts: {
    _id: string;
    name: string;
    slug: string;
  }[];
  /** SA operational flags — optional until Sanity schema is fully populated */
  has_generator_backup?: boolean | null;
  has_big_screens?: boolean | null;
  has_live_audio?: boolean | null;
  has_craft_drafts?: boolean | null;
  phone?: string | null;
  website?: string | null;
};

// defineField({
//   name: 'address',
//   title: 'Address',
//   type: 'object',
//   fields: [
//     defineField({name: 'street', title: 'Street', type: 'string'}),
//     defineField({
//       name: 'suburb',
//       title: 'Suburb',
//       type: 'reference',
//       to: [{type: 'location', options: {filter: 'type == "suburb"'}}],
//     }),
//     defineField({
//       name: 'city',
//       title: 'City',
//       type: 'reference',
//       to: [{type: 'location', options: {filter: 'type == "city"'}}],
//     }),
//     defineField({name: 'postcode', title: 'Postcode', type: 'string'}),
//     defineField({name: 'province', title: 'Province', type: 'string'}),
//     defineField({name: 'country', title: 'Country', type: 'string'}),
//   ],
// }),

/** Full venue document for venue detail pages (watch/play from linked sports). */
export type VenueDetail = Venue & {
  // watch: Activity[];
  // play: Activity[];
};

export async function listVenues() {
  const venues = await sanityClient.fetch<Venue[]>(`
    *[_type == "venue"] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      description,
      phone,
      website,
      has_generator_backup,
      has_big_screens,
      has_live_audio,
      has_craft_drafts,
      "address": {
        "street": address.street,
        "province": address.province,
        "postcode": address.postcode,
        "country": address.country,
        // Dereference the specific fields, not the parent 'address'
        "suburb": address.suburb->title,
        "city": address.city->title
      },
      "sports": sports[]-> {
        _id,
        name,
        image,
      },
      "broadcasts": broadcasts[]-> {
        _id,
        name,
        slug,
      },
    }
    `);

  return venues;
}

export async function getVenueBySlug(
  slug: string,
): Promise<VenueDetail | null> {
  if (!slug) return null;

  const row = await sanityClient.fetch<{
    _id: string;
    name: string;
    slug: string | null;
    description: string | null;
    address: {
      street: string;
      suburb: string;
      city: string;
      province: string;
      postcode: string;
      country: string;
    } | null;
    sports: {
      _id: string;
      name: string;
      image: SanityImageSource | undefined;
    }[];
    broadcasts: {
      _id: string;
      name: string;
      slug: string;
    }[];
    has_generator_backup?: boolean | null;
    has_big_screens?: boolean | null;
    has_live_audio?: boolean | null;
    has_craft_drafts?: boolean | null;
    phone?: string | null;
    website?: string | null;
  } | null>(
    `*[_type == "venue" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      phone,
      website,
      has_generator_backup,
      has_big_screens,
      has_live_audio,
      has_craft_drafts,
      "address": {
        "street": address.street,
        "province": address.province,
        "postcode": address.postcode,
        "country": address.country,
        "suburb": address.suburb->title,
        "city": address.city->title
      },
      "sports": sports[]-> {
        _id,
        name,
        image,
      },
      "broadcasts": broadcasts[]-> {
        _id,
        name,
        "slug": slug.current,
      }
    }`,
    { slug },
  );

  if (!row?.slug) return null;

  return {
    _id: row._id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    address: row.address ?? {
      street: "",
      suburb: "",
      city: "",
      province: "",
      postcode: "",
      country: "",
    },
    sports: row.sports ?? [],
    broadcasts: row.broadcasts ?? [],
    has_generator_backup: row.has_generator_backup ?? null,
    has_big_screens: row.has_big_screens ?? null,
    has_live_audio: row.has_live_audio ?? null,
    has_craft_drafts: row.has_craft_drafts ?? null,
    phone: row.phone ?? null,
    website: row.website ?? null,
  };
}
