export type VenueClaimStatus = "unclaimed" | "claim_pending" | "claimed" | null;

export type ScreeningEditorAuthInput = {
  claim_status?: string | null;
  claimedByUserId?: string | null;
  sessionUserId?: string | null;
};

export type ScreeningInput = {
  title?: unknown;
  startsAt?: unknown;
  fixtureSlug?: unknown;
  setupTags?: unknown;
};

export type ValidatedScreening = {
  title: string;
  startsAt: string;
  fixtureSlug?: string;
  setupTags?: string[];
};

const TITLE_MIN = 2;
const TITLE_MAX = 120;
const FIXTURE_SLUG_RE = /^[a-z0-9-]{1,80}$/;
const SETUP_TAGS_MAX = 8;
const SETUP_TAG_MAX_CHARS = 32;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * True only when the session user owns this listing and the claim is
 * pending or approved — so a claimant who just submitted can prep listings
 * while ops approves.
 */
export function canManageVenueScreenings({
  claim_status,
  claimedByUserId,
  sessionUserId,
}: ScreeningEditorAuthInput): boolean {
  const session = asTrimmedString(sessionUserId);
  const owner = asTrimmedString(claimedByUserId);
  if (!session || session !== owner) return false;
  return claim_status === "claimed" || claim_status === "claim_pending";
}

export function isEmptyOwnerId(value: unknown): boolean {
  return asTrimmedString(value) === "";
}

function parseStartsAt(value: unknown): string | null {
  const raw = asTrimmedString(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parseFixtureSlug(value: unknown): string | null | { error: string } {
  if (value == null) return null;
  if (typeof value !== "string") {
    return { error: "fixtureSlug must be a string" };
  }
  const slug = value.trim().toLowerCase();
  if (!slug) return null;
  if (!FIXTURE_SLUG_RE.test(slug)) {
    return {
      error:
        "fixtureSlug must be lowercase letters, numbers, or hyphens (1–80 chars)",
    };
  }
  return slug;
}

function parseSetupTags(value: unknown): string[] | { error: string } {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    return { error: "setupTags must be an array of strings" };
  }
  if (value.length > SETUP_TAGS_MAX) {
    return { error: `setupTags allows at most ${SETUP_TAGS_MAX} tags` };
  }
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      return { error: "Each setup tag must be a string" };
    }
    const tag = item.trim();
    if (!tag) continue;
    if (tag.length > SETUP_TAG_MAX_CHARS) {
      return {
        error: `Each setup tag must be at most ${SETUP_TAG_MAX_CHARS} characters`,
      };
    }
    tags.push(tag);
    if (tags.length > SETUP_TAGS_MAX) {
      return { error: `setupTags allows at most ${SETUP_TAGS_MAX} tags` };
    }
  }
  return tags;
}

export function validateScreening(
  input: ScreeningInput,
  index: number,
): { ok: true; screening: ValidatedScreening } | { ok: false; error: string } {
  const title = asTrimmedString(input.title);
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    return {
      ok: false,
      error: `Screening ${index + 1}: title must be ${TITLE_MIN}–${TITLE_MAX} characters`,
    };
  }

  const startsAt = parseStartsAt(input.startsAt);
  if (!startsAt) {
    return {
      ok: false,
      error: `Screening ${index + 1}: startsAt must be a parseable datetime`,
    };
  }

  const fixtureSlug = parseFixtureSlug(input.fixtureSlug);
  if (fixtureSlug && typeof fixtureSlug === "object" && "error" in fixtureSlug) {
    return { ok: false, error: `Screening ${index + 1}: ${fixtureSlug.error}` };
  }

  const setupTags = parseSetupTags(input.setupTags);
  if (!Array.isArray(setupTags)) {
    return { ok: false, error: `Screening ${index + 1}: ${setupTags.error}` };
  }

  const screening: ValidatedScreening = { title, startsAt };
  if (typeof fixtureSlug === "string") screening.fixtureSlug = fixtureSlug;
  if (setupTags.length > 0) screening.setupTags = setupTags;
  return { ok: true, screening };
}

export function validateScreeningsPayload(
  body: unknown,
):
  | { ok: true; screenings: ValidatedScreening[] }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  const screenings = (body as { screenings?: unknown }).screenings;
  if (!Array.isArray(screenings)) {
    return { ok: false, error: "screenings must be an array" };
  }

  const validated: ValidatedScreening[] = [];
  for (let i = 0; i < screenings.length; i += 1) {
    const row = screenings[i];
    if (!row || typeof row !== "object") {
      return { ok: false, error: `Screening ${i + 1}: must be an object` };
    }
    const result = validateScreening(row as ScreeningInput, i);
    if (!result.ok) return result;
    validated.push(result.screening);
  }
  return { ok: true, screenings: validated };
}

export function screeningDocumentItems(screenings: ValidatedScreening[]) {
  return screenings.map((screening) => {
    const item: {
      _key: string;
      _type: "screening";
      title: string;
      startsAt: string;
      fixtureSlug?: string;
      setupTags?: string[];
    } = {
      _key: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
      _type: "screening",
      title: screening.title,
      startsAt: screening.startsAt,
    };
    if (screening.fixtureSlug) item.fixtureSlug = screening.fixtureSlug;
    if (screening.setupTags && screening.setupTags.length > 0) {
      item.setupTags = screening.setupTags;
    }
    return item;
  });
}
