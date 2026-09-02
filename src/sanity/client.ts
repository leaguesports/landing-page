import { createClient } from "next-sanity";

export { safeSanityImageUrl, urlFor } from "@/lib/sanity-image";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "v2026-03-08",
  useCdn: true,
});
