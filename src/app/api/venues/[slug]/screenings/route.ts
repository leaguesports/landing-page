import { NextResponse } from "next/server";
import { getSanityReadClient, getSanityWriteClient } from "@/lib/sanity/write-client";
import { getAuthStateFromCookieHeader } from "@/lib/server-auth";
import {
  canManageVenueScreenings,
  screeningDocumentItems,
  validateScreeningsPayload,
} from "@/lib/venues/screening-editor";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type VenueScreeningDoc = {
  _id: string;
  claim_status?: string | null;
  claimedByUserId?: string | null;
  upcoming_screenings?: Array<{
    title?: string | null;
    startsAt?: string | null;
    fixtureSlug?: string | null;
    setupTags?: string[] | null;
  }> | null;
};

const VENUE_SCREENINGS_QUERY = `*[_type == "venue" && slug.current == $slug][0]{
  _id,
  claim_status,
  claimedByUserId,
  upcoming_screenings[]{ title, startsAt, fixtureSlug, setupTags }
}`;

function publicScreenings(venue: VenueScreeningDoc) {
  return (venue.upcoming_screenings ?? [])
    .filter((row) => row?.title && row?.startsAt)
    .map((row) => ({
      title: row.title,
      startsAt: row.startsAt,
      ...(row.fixtureSlug ? { fixtureSlug: row.fixtureSlug } : {}),
      ...(row.setupTags && row.setupTags.length > 0
        ? { setupTags: row.setupTags }
        : {}),
    }));
}

async function requireSession(request: Request) {
  const auth = await getAuthStateFromCookieHeader(request.headers.get("cookie"));
  const sessionUserId = auth.user?.id?.trim() ?? "";
  if (!sessionUserId) {
    return {
      error: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  return { sessionUserId };
}

async function loadManagedVenue(slug: string, sessionUserId: string) {
  const client = getSanityWriteClient() ?? getSanityReadClient();
  if (!client) {
    return {
      error: NextResponse.json(
        { error: "Screenings are temporarily unavailable" },
        { status: 503 },
      ),
    };
  }

  const value = slug.trim();
  const venue = value
    ? await client.fetch<VenueScreeningDoc | null>(VENUE_SCREENINGS_QUERY, {
        slug: value,
      })
    : null;

  if (!venue) {
    return {
      error: NextResponse.json({ error: "Venue not found" }, { status: 404 }),
    };
  }

  if (
    !canManageVenueScreenings({
      claim_status: venue.claim_status,
      claimedByUserId: venue.claimedByUserId,
      sessionUserId,
    })
  ) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { venue };
}

export async function GET(request: Request, context: RouteContext) {
  const session = await requireSession(request);
  if (session.error) return session.error;

  const { slug } = await context.params;
  const access = await loadManagedVenue(slug, session.sessionUserId);
  if (access.error) return access.error;

  return NextResponse.json({ screenings: publicScreenings(access.venue) });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireSession(request);
  if (session.error) return session.error;

  const { slug } = await context.params;
  const access = await loadManagedVenue(slug, session.sessionUserId);
  if (access.error) return access.error;

  const writeClient = getSanityWriteClient();
  if (!writeClient) {
    return NextResponse.json(
      { error: "Screenings are temporarily unavailable" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateScreeningsPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const items = screeningDocumentItems(parsed.screenings);

  try {
    await writeClient
      .patch(access.venue._id)
      .set({ upcoming_screenings: items })
      .commit();
  } catch (error) {
    console.error("[screenings] Sanity patch failed", error);
    return NextResponse.json(
      { error: "Could not save screenings" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    screenings: parsed.screenings,
  });
}
