import { createClient, type SanityClient } from "next-sanity";

const SANITY_API_VERSION = "v2026-03-08";

function getProjectConfig(): { projectId: string; dataset: string } | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;
  return { projectId, dataset };
}

/** Unauthenticated read client (no CDN) for claim / screening writes. */
export function getSanityReadClient(): SanityClient | null {
  const config = getProjectConfig();
  if (!config) return null;
  return createClient({
    ...config,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
  });
}

/**
 * Authenticated Sanity write client. Same token as `/api/venues/claim`.
 * Returns null when SANITY_API_TOKEN or project config is missing.
 * Do not log the token.
 */
export function getSanityWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_TOKEN;
  const config = getProjectConfig();
  if (!token || !config) return null;
  return createClient({
    ...config,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token,
  });
}
