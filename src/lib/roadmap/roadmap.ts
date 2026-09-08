import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export const ROADMAP_HREF = "/roadmap" as const;
export const ROADMAP_PREFERENCES_HREF = "/roadmap/preferences" as const;
export const ROADMAP_UNSUBSCRIBE_HREF = "/roadmap/unsubscribe" as const;

export const ROADMAP_FEATURES_PATH = "/api/roadmap/features" as const;
export const ROADMAP_UNSUBSCRIBE_PATH = "/api/roadmap/unsubscribe" as const;
export const ROADMAP_PREFERENCES_PATH = "/api/roadmap/preferences" as const;
export const ROADMAP_REQUESTS_PATH = "/api/roadmap/requests" as const;

/** Explicit Railway rewrite sources. Vote/notify before a catch-all `:id`. */
export const ROADMAP_PROXY_SOURCES = [
  ROADMAP_FEATURES_PATH,
  "/api/roadmap/features/:id/vote",
  "/api/roadmap/features/:id/notify",
  ROADMAP_UNSUBSCRIBE_PATH,
  ROADMAP_PREFERENCES_PATH,
  ROADMAP_REQUESTS_PATH,
] as const;

export const ROADMAP_FEATURE_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "SHIPPED",
] as const;
export type RoadmapFeatureStatus = (typeof ROADMAP_FEATURE_STATUSES)[number];

export const ROADMAP_FEATURE_FILTERS = [
  "ALL",
  ...ROADMAP_FEATURE_STATUSES,
] as const;
export type RoadmapFeatureFilter = (typeof ROADMAP_FEATURE_FILTERS)[number];

export const ROADMAP_SORTS = ["votes", "newest"] as const;
export type RoadmapFeatureSort = (typeof ROADMAP_SORTS)[number];

export const ROADMAP_REQUEST_TYPES = ["FEATURE_REQUEST", "BUG"] as const;
export type RoadmapRequestType = (typeof ROADMAP_REQUEST_TYPES)[number];

export const ROADMAP_REQUEST_STATUSES = ["NEW", "PLANNED", "DONE"] as const;
export type RoadmapRequestStatus = (typeof ROADMAP_REQUEST_STATUSES)[number];

export const ROADMAP_FEATURE_STATUS_LABELS: Record<RoadmapFeatureStatus, string> =
  {
    PLANNED: "Planned",
    IN_PROGRESS: "In progress",
    SHIPPED: "Shipped",
  };

export const ROADMAP_FEATURE_FILTER_OPTIONS: {
  id: RoadmapFeatureFilter;
  label: string;
}[] = [
  { id: "ALL", label: "All" },
  { id: "PLANNED", label: "Planned" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "SHIPPED", label: "Shipped" },
];

export const ROADMAP_SORT_OPTIONS: {
  id: RoadmapFeatureSort;
  label: string;
}[] = [
  { id: "votes", label: "Most votes" },
  { id: "newest", label: "Newest" },
];

export const ROADMAP_REQUEST_TYPE_LABELS: Record<RoadmapRequestType, string> = {
  FEATURE_REQUEST: "Feature request",
  BUG: "Bug",
};

export const ROADMAP_REQUEST_STATUS_LABELS: Record<RoadmapRequestStatus, string> =
  {
    NEW: "New",
    PLANNED: "Planned",
    DONE: "Done",
  };

export const ROADMAP_FEATURES_EMPTY_COPY =
  "Nothing on the board yet — check Requests…" as const;

export const ROADMAP_DESCRIPTION_PREVIEW_CHARS = 180;
export const ROADMAP_REQUEST_TITLE_MAX = 200;
export const ROADMAP_REQUEST_DETAILS_MAX = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PublicRoadmapFeature = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  status: RoadmapFeatureStatus;
  shippedAt: string | null;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  viewerHasVoted: boolean;
};

export type PublicRoadmapRequest = {
  id: string;
  type: RoadmapRequestType;
  title: string;
  status: RoadmapRequestStatus;
  createdAt: string;
};

export type PublicWatchingFeature = {
  id: string;
  slug: string | null;
  title: string;
  status: RoadmapFeatureStatus;
};

export type RoadmapPreferences = {
  email: string;
  features: PublicWatchingFeature[];
};

export type ListRoadmapFeaturesQuery = {
  status?: RoadmapFeatureFilter;
  sort?: RoadmapFeatureSort;
};

export type CreateRoadmapRequestInput = {
  type: RoadmapRequestType;
  title: string;
  details: string;
  email?: string;
};

export type RoadmapVoteResult = {
  voted: boolean;
  voteCount: number;
};

export type RoadmapNotifyResult = {
  watching: true;
};

export type RoadmapUnsubscribeResult = {
  email: string;
  unsubscribed: true;
  count: number;
};

export type RoadmapRemovePreferenceResult = {
  removed: boolean;
};

export type RoadmapDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type RoadmapResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorFromBody(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

export function isRoadmapFeatureStatus(
  value: unknown,
): value is RoadmapFeatureStatus {
  return (
    value === "PLANNED" || value === "IN_PROGRESS" || value === "SHIPPED"
  );
}

export function isRoadmapFeatureSort(
  value: unknown,
): value is RoadmapFeatureSort {
  return value === "votes" || value === "newest";
}

export function isRoadmapRequestType(
  value: unknown,
): value is RoadmapRequestType {
  return value === "FEATURE_REQUEST" || value === "BUG";
}

export function isRoadmapRequestStatus(
  value: unknown,
): value is RoadmapRequestStatus {
  return value === "NEW" || value === "PLANNED" || value === "DONE";
}

export function parseFeatureFilter(value: unknown): RoadmapFeatureFilter {
  if (isRoadmapFeatureStatus(value)) return value;
  return "ALL";
}

export function parseFeatureSort(value: unknown): RoadmapFeatureSort {
  if (value === "newest") return "newest";
  return "votes";
}

export function featureStatusLabel(status: RoadmapFeatureStatus): string {
  return ROADMAP_FEATURE_STATUS_LABELS[status];
}

export function requestTypeLabel(type: RoadmapRequestType): string {
  return ROADMAP_REQUEST_TYPE_LABELS[type];
}

export function requestStatusLabel(status: RoadmapRequestStatus): string {
  return ROADMAP_REQUEST_STATUS_LABELS[status];
}

export function isShippedFeature(
  feature: Pick<PublicRoadmapFeature, "status">,
): boolean {
  return feature.status === "SHIPPED";
}

export function shouldCollapseDescription(description: string): boolean {
  return description.trim().length > ROADMAP_DESCRIPTION_PREVIEW_CHARS;
}

export function isRoadmapEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function normalizeNotifyEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return null;
  return email;
}

export function buildFeaturesSearchParams(
  query: ListRoadmapFeaturesQuery = {},
): URLSearchParams {
  const params = new URLSearchParams();
  const status = parseFeatureFilter(query.status);
  const sort = parseFeatureSort(query.sort);
  if (status !== "ALL") params.set("status", status);
  if (sort !== "votes") params.set("sort", sort);
  return params;
}

export function featuresListUrl(
  baseUrl: string,
  query: ListRoadmapFeaturesQuery = {},
): string {
  const root = `${baseUrl.replace(/\/$/, "")}${ROADMAP_FEATURES_PATH}`;
  const qs = buildFeaturesSearchParams(query).toString();
  return qs ? `${root}?${qs}` : root;
}

export function featureVoteUrl(baseUrl: string, id: string): string {
  return `${baseUrl.replace(/\/$/, "")}${ROADMAP_FEATURES_PATH}/${encodeURIComponent(id)}/vote`;
}

export function featureNotifyUrl(baseUrl: string, id: string): string {
  return `${baseUrl.replace(/\/$/, "")}${ROADMAP_FEATURES_PATH}/${encodeURIComponent(id)}/notify`;
}

export function requestsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${ROADMAP_REQUESTS_PATH}`;
}

export function unsubscribeUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${ROADMAP_UNSUBSCRIBE_PATH}`;
}

export function preferencesUrl(baseUrl: string, token: string): string {
  const root = `${baseUrl.replace(/\/$/, "")}${ROADMAP_PREFERENCES_PATH}`;
  const params = new URLSearchParams();
  params.set("token", token);
  return `${root}?${params.toString()}`;
}

export function preferencesHref(token: string): string {
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  const qs = params.toString();
  return qs ? `${ROADMAP_PREFERENCES_HREF}?${qs}` : ROADMAP_PREFERENCES_HREF;
}

export function unsubscribePageHref(token: string): string {
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  const qs = params.toString();
  return qs ? `${ROADMAP_UNSUBSCRIBE_HREF}?${qs}` : ROADMAP_UNSUBSCRIBE_HREF;
}

export function parseRoadmapFeature(value: unknown): PublicRoadmapFeature | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !row.id.trim() ||
    typeof row.title !== "string" ||
    typeof row.description !== "string" ||
    !isRoadmapFeatureStatus(row.status) ||
    typeof row.voteCount !== "number" ||
    !Number.isFinite(row.voteCount) ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    slug: typeof row.slug === "string" && row.slug.trim() ? row.slug : null,
    title: row.title,
    description: row.description,
    status: row.status,
    shippedAt: typeof row.shippedAt === "string" ? row.shippedAt : null,
    voteCount: Math.max(0, Math.floor(row.voteCount)),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    viewerHasVoted: row.viewerHasVoted === true,
  };
}

export function parseRoadmapFeatureList(value: unknown): PublicRoadmapFeature[] {
  if (!value || typeof value !== "object") return [];
  const rows = (value as { features?: unknown }).features;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const parsed = parseRoadmapFeature(row);
    return parsed ? [parsed] : [];
  });
}

export function parsePublicRoadmapRequest(
  value: unknown,
): PublicRoadmapRequest | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !row.id.trim() ||
    !isRoadmapRequestType(row.type) ||
    typeof row.title !== "string" ||
    !isRoadmapRequestStatus(row.status) ||
    typeof row.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    status: row.status,
    createdAt: row.createdAt,
  };
}

export function parseRoadmapRequestList(value: unknown): PublicRoadmapRequest[] {
  if (!value || typeof value !== "object") return [];
  const rows = (value as { requests?: unknown }).requests;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const parsed = parsePublicRoadmapRequest(row);
    return parsed ? [parsed] : [];
  });
}

export function parseWatchingFeature(
  value: unknown,
): PublicWatchingFeature | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !row.id.trim() ||
    typeof row.title !== "string" ||
    !isRoadmapFeatureStatus(row.status)
  ) {
    return null;
  }
  return {
    id: row.id,
    slug: typeof row.slug === "string" && row.slug.trim() ? row.slug : null,
    title: row.title,
    status: row.status,
  };
}

export function parseRoadmapPreferences(
  value: unknown,
): RoadmapPreferences | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.email !== "string" || !Array.isArray(row.features)) {
    return null;
  }
  return {
    email: row.email,
    features: row.features.flatMap((item) => {
      const parsed = parseWatchingFeature(item);
      return parsed ? [parsed] : [];
    }),
  };
}

export function parseVoteResult(value: unknown): RoadmapVoteResult | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.voted !== "boolean" || typeof row.voteCount !== "number") {
    return null;
  }
  return {
    voted: row.voted,
    voteCount: Math.max(0, Math.floor(row.voteCount)),
  };
}

export function parseNotifyResult(value: unknown): RoadmapNotifyResult | null {
  if (!value || typeof value !== "object") return null;
  if ((value as { watching?: unknown }).watching !== true) return null;
  return { watching: true };
}

export function parseUnsubscribeResult(
  value: unknown,
): RoadmapUnsubscribeResult | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.email !== "string" ||
    row.unsubscribed !== true ||
    typeof row.count !== "number"
  ) {
    return null;
  }
  return {
    email: row.email,
    unsubscribed: true,
    count: Math.max(0, Math.floor(row.count)),
  };
}

export function parseRemovePreferenceResult(
  value: unknown,
): RoadmapRemovePreferenceResult | null {
  if (!value || typeof value !== "object") return null;
  const removed = (value as { removed?: unknown }).removed;
  if (typeof removed !== "boolean") return null;
  return { removed };
}

export function applyVoteResult(
  feature: PublicRoadmapFeature,
  result: RoadmapVoteResult,
): PublicRoadmapFeature {
  return {
    ...feature,
    viewerHasVoted: result.voted,
    voteCount: result.voteCount,
  };
}

export function partitionFeaturesForBoard(
  features: PublicRoadmapFeature[],
  filter: RoadmapFeatureFilter,
): {
  primary: PublicRoadmapFeature[];
  shipped: PublicRoadmapFeature[];
} {
  if (filter !== "ALL") {
    return { primary: features, shipped: [] };
  }
  const primary: PublicRoadmapFeature[] = [];
  const shipped: PublicRoadmapFeature[] = [];
  for (const feature of features) {
    if (feature.status === "SHIPPED") shipped.push(feature);
    else primary.push(feature);
  }
  return { primary, shipped };
}

export function buildCreateRequestPayload(input: {
  type: unknown;
  title: unknown;
  details: unknown;
  email?: unknown;
}): { ok: true; payload: CreateRoadmapRequestInput } | { ok: false; error: string } {
  if (!isRoadmapRequestType(input.type)) {
    return { ok: false, error: "Choose a request type" };
  }
  if (typeof input.title !== "string" || !input.title.trim()) {
    return { ok: false, error: "Title is required" };
  }
  if (typeof input.details !== "string" || !input.details.trim()) {
    return { ok: false, error: "Details are required" };
  }
  const title = input.title.trim();
  const details = input.details.trim();
  if (title.length > ROADMAP_REQUEST_TITLE_MAX) {
    return {
      ok: false,
      error: `Title must be ${ROADMAP_REQUEST_TITLE_MAX} characters or fewer`,
    };
  }
  if (details.length > ROADMAP_REQUEST_DETAILS_MAX) {
    return {
      ok: false,
      error: `Details must be ${ROADMAP_REQUEST_DETAILS_MAX} characters or fewer`,
    };
  }

  const payload: CreateRoadmapRequestInput = {
    type: input.type,
    title,
    details,
  };

  if (typeof input.email === "string" && input.email.trim()) {
    const email = normalizeNotifyEmail(input.email);
    if (!email) return { ok: false, error: "Enter a valid email" };
    payload.email = email;
  }

  return { ok: true, payload };
}

function unexpected(status: number, fallback: string): string {
  return `${fallback} (${status})`;
}

export async function listRoadmapFeaturesWith(
  query: ListRoadmapFeaturesQuery,
  deps: RoadmapDeps,
): Promise<RoadmapResult<PublicRoadmapFeature[]>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, featuresListUrl(deps.baseUrl, query), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, unexpected(res.status, "Could not load features")),
        status: res.status,
      };
    }
    return { ok: true, value: parseRoadmapFeatureList(body) };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function toggleRoadmapVoteWith(
  id: string,
  deps: RoadmapDeps,
): Promise<RoadmapResult<RoadmapVoteResult>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const featureId = id.trim();
  if (!featureId) {
    return { ok: false, error: "Feature is required", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, featureVoteUrl(deps.baseUrl, featureId), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, unexpected(res.status, "Could not save vote")),
        status: res.status,
      };
    }
    const parsed = parseVoteResult(body);
    if (!parsed) {
      return { ok: false, error: "Unexpected vote response", status: 500 };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function notifyRoadmapFeatureWith(
  id: string,
  email: string,
  deps: RoadmapDeps,
): Promise<RoadmapResult<RoadmapNotifyResult>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const featureId = id.trim();
  const normalized = normalizeNotifyEmail(email);
  if (!featureId) {
    return { ok: false, error: "Feature is required", status: 400 };
  }
  if (!normalized) {
    return { ok: false, error: "Enter a valid email", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      featureNotifyUrl(deps.baseUrl, featureId),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({ email: normalized }),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, unexpected(res.status, "Could not save email")),
        status: res.status,
      };
    }
    const parsed = parseNotifyResult(body);
    if (!parsed) {
      return { ok: false, error: "Unexpected notify response", status: 500 };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function listRoadmapRequestsWith(
  deps: RoadmapDeps,
): Promise<RoadmapResult<PublicRoadmapRequest[]>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, requestsUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, unexpected(res.status, "Could not load requests")),
        status: res.status,
      };
    }
    return { ok: true, value: parseRoadmapRequestList(body) };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function createRoadmapRequestWith(
  input: CreateRoadmapRequestInput,
  deps: RoadmapDeps,
): Promise<RoadmapResult<PublicRoadmapRequest>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const built = buildCreateRequestPayload(input);
  if (!built.ok) {
    return { ok: false, error: built.error, status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, requestsUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, unexpected(res.status, "Could not send request")),
        status: res.status,
      };
    }
    const parsed = parsePublicRoadmapRequest(
      body && typeof body === "object"
        ? (body as { request?: unknown }).request
        : null,
    );
    if (!parsed) {
      return { ok: false, error: "Unexpected request response", status: 500 };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function getRoadmapPreferencesWith(
  token: string,
  deps: RoadmapDeps,
): Promise<RoadmapResult<RoadmapPreferences>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Unsubscribe token is missing", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      preferencesUrl(deps.baseUrl, trimmed),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(
          body,
          unexpected(res.status, "Could not load watching list"),
        ),
        status: res.status,
      };
    }
    const parsed = parseRoadmapPreferences(body);
    if (!parsed) {
      return { ok: false, error: "Unexpected preferences response", status: 500 };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function removeRoadmapPreferenceWith(
  input: { token: string; featureId: string },
  deps: RoadmapDeps,
): Promise<RoadmapResult<RoadmapRemovePreferenceResult>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const token = input.token.trim();
  const featureId = input.featureId.trim();
  if (!token || !featureId) {
    return { ok: false, error: "Token and feature are required", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      `${deps.baseUrl.replace(/\/$/, "")}${ROADMAP_PREFERENCES_PATH}`,
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({ token, featureId }),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(
          body,
          unexpected(res.status, "Could not stop watching"),
        ),
        status: res.status,
      };
    }
    const parsed = parseRemovePreferenceResult(body);
    if (!parsed) {
      return { ok: false, error: "Unexpected preferences response", status: 500 };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

export async function unsubscribeRoadmapWith(
  token: string,
  deps: RoadmapDeps,
): Promise<RoadmapResult<RoadmapUnsubscribeResult>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Unsubscribe token is missing", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, unsubscribeUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify({ token: trimmed }),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(
          body,
          unexpected(res.status, "Could not unsubscribe"),
        ),
        status: res.status,
      };
    }
    const parsed = parseUnsubscribeResult(body);
    if (!parsed) {
      return { ok: false, error: "Unexpected unsubscribe response", status: 500 };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Could not reach roadmap API", status: 0 };
  }
}

function clientDeps(options: { cookie?: string; signal?: AbortSignal } = {}): RoadmapDeps | null {
  const baseUrl = browserBaseUrl();
  if (!baseUrl && !isApiConfigured()) return null;
  return {
    fetch,
    baseUrl: baseUrl || getRailwayApiOrigin(),
    cookie: options.cookie,
    signal: options.signal ?? AbortSignal.timeout(8000),
  };
}

export async function listRoadmapFeatures(
  query: ListRoadmapFeaturesQuery = {},
  options: { cookie?: string } = {},
): Promise<RoadmapResult<PublicRoadmapFeature[]>> {
  const deps = clientDeps(options);
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return listRoadmapFeaturesWith(query, deps);
}

export async function toggleRoadmapVote(
  id: string,
): Promise<RoadmapResult<RoadmapVoteResult>> {
  const deps = clientDeps();
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return toggleRoadmapVoteWith(id, deps);
}

export async function notifyRoadmapFeature(
  id: string,
  email: string,
): Promise<RoadmapResult<RoadmapNotifyResult>> {
  const deps = clientDeps();
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return notifyRoadmapFeatureWith(id, email, deps);
}

export async function listRoadmapRequests(
  options: { cookie?: string } = {},
): Promise<RoadmapResult<PublicRoadmapRequest[]>> {
  const deps = clientDeps(options);
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return listRoadmapRequestsWith(deps);
}

export async function createRoadmapRequest(
  input: CreateRoadmapRequestInput,
): Promise<RoadmapResult<PublicRoadmapRequest>> {
  const deps = clientDeps({ signal: AbortSignal.timeout(10000) });
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return createRoadmapRequestWith(input, deps);
}

export async function getRoadmapPreferences(
  token: string,
): Promise<RoadmapResult<RoadmapPreferences>> {
  const deps = clientDeps();
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return getRoadmapPreferencesWith(token, deps);
}

export async function removeRoadmapPreference(input: {
  token: string;
  featureId: string;
}): Promise<RoadmapResult<RoadmapRemovePreferenceResult>> {
  const deps = clientDeps();
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return removeRoadmapPreferenceWith(input, deps);
}

export async function unsubscribeRoadmap(
  token: string,
): Promise<RoadmapResult<RoadmapUnsubscribeResult>> {
  const deps = clientDeps();
  if (!deps) return { ok: false, error: "API is not configured", status: 0 };
  return unsubscribeRoadmapWith(token, deps);
}
