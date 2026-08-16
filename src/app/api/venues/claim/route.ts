import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

type ClaimBody = {
  venueSlug?: unknown;
  fullName?: unknown;
  businessEmail?: unknown;
  contactNumber?: unknown;
  role?: unknown;
  notes?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getWriteClient() {
  const token = process.env.SANITY_API_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!token || !projectId || !dataset) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion: "v2026-03-08",
    useCdn: false,
    token,
  });
}

export async function POST(request: Request) {
  let body: ClaimBody;

  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const venueSlug = asTrimmedString(body.venueSlug);
  const fullName = asTrimmedString(body.fullName);
  const businessEmail = asTrimmedString(body.businessEmail);
  const contactNumber = asTrimmedString(body.contactNumber);
  const role = asTrimmedString(body.role);
  const notes = asTrimmedString(body.notes);

  if (!venueSlug) {
    return NextResponse.json({ error: "Venue slug is required" }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!businessEmail || !isValidEmail(businessEmail)) {
    return NextResponse.json(
      { error: "A valid business email is required" },
      { status: 400 },
    );
  }
  if (!contactNumber || contactNumber.replace(/\D/g, "").length < 9) {
    return NextResponse.json(
      { error: "A valid contact / WhatsApp number is required" },
      { status: 400 },
    );
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    return NextResponse.json(
      { error: "Venue claims are temporarily unavailable" },
      { status: 503 },
    );
  }

  const readClient = createClient({
    projectId,
    dataset,
    apiVersion: "v2026-03-08",
    useCdn: false,
  });

  const venue = await readClient.fetch<{
    _id: string;
    name: string;
    slug: string;
  } | null>(
    `*[_type == "venue" && slug.current == $slug][0]{
      _id,
      name,
      "slug": slug.current
    }`,
    { slug: venueSlug },
  );

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const claimPayload = {
    venueId: venue._id,
    venueSlug: venue.slug,
    venueName: venue.name,
    fullName,
    businessEmail,
    contactNumber,
    role: role || null,
    notes: notes || null,
    submittedAt: new Date().toISOString(),
  };

  const writeClient = getWriteClient();

  if (writeClient) {
    try {
      await writeClient
        .patch(venue._id)
        .set({
          claim_status: "claim_pending",
          claim_request: {
            fullName,
            businessEmail,
            contactNumber,
            role: role || undefined,
            notes: notes || undefined,
            submittedAt: claimPayload.submittedAt,
          },
        })
        .commit();
    } catch (error) {
      console.error("[claim] Sanity patch failed", error);
      // Continue — webhook/email still notifies the team
    }
  }

  const webhookUrl = process.env.CLAIM_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "venue.claim_pending",
          ...claimPayload,
        }),
      });
      if (!webhookRes.ok) {
        console.error(
          "[claim] Webhook failed",
          webhookRes.status,
          await webhookRes.text().catch(() => ""),
        );
      }
    } catch (error) {
      console.error("[claim] Webhook request error", error);
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.CLAIM_NOTIFY_EMAIL ?? "privacy@leaguesports.co.za";
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CLAIM_FROM_EMAIL ?? "LeagueSports <onboarding@resend.dev>",
          to: [notifyTo],
          subject: `Venue claim: ${venue.name}`,
          text: [
            `Venue: ${venue.name} (${venue.slug})`,
            `Name: ${fullName}`,
            `Email: ${businessEmail}`,
            `Phone: ${contactNumber}`,
            `Role: ${role || "—"}`,
            `Notes: ${notes || "—"}`,
            `Submitted: ${claimPayload.submittedAt}`,
          ].join("\n"),
        }),
      });
    } catch (error) {
      console.error("[claim] Resend notify failed", error);
    }
  }

  if (!writeClient && !webhookUrl && !resendKey) {
    console.info("[claim] Claim received (no notify channel configured)", claimPayload);
  }

  return NextResponse.json({ ok: true });
}
