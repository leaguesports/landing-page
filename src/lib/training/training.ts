import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

/** Catalog highlight — POST this id from the empty CTA. GET remains source of truth. */
export const PREFERRED_PLAN_ID = "accuracy-focus";

export const TRAINING_SPORTS = ["padel"] as const;
export type TrainingSport = (typeof TRAINING_SPORTS)[number];

export const TRAINING_FOCUSES = ["accuracy", "consistency", "intensity"] as const;
export type TrainingFocus = (typeof TRAINING_FOCUSES)[number];

export const ENROLLMENT_STATUSES = ["active", "completed"] as const;
export type TrainingEnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export type TrainingStep = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type TrainingPlan = {
  id: string;
  title: string;
  sport: TrainingSport;
  focus: TrainingFocus | null;
  steps: TrainingStep[];
  totalDurationMinutes: number;
};

export type TrainingEnrollment = {
  id: string;
  planId: string;
  status: TrainingEnrollmentStatus;
  completedStepIds: string[];
  percentComplete: number;
  currentStepIndex: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TrainingSnapshot = {
  plans: TrainingPlan[];
  enrollments: TrainingEnrollment[];
};

export type TrainingDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type TrainingResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

export type EnrollResult = {
  enrollment: TrainingEnrollment;
  resumed: boolean;
};

export type AdvanceEnrollmentInput =
  | { completedStepIds: string[]; percentComplete?: never }
  | { percentComplete: number; completedStepIds?: never };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function rootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/training`;
}

function plansUrl(baseUrl: string): string {
  return `${rootUrl(baseUrl)}/plans`;
}

function enrollmentsUrl(baseUrl: string): string {
  return `${rootUrl(baseUrl)}/enrollments`;
}

function enrollmentUrl(baseUrl: string, id: string): string {
  return `${enrollmentsUrl(baseUrl)}/${encodeURIComponent(id)}`;
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

function isTrainingSport(value: unknown): value is TrainingSport {
  return value === "padel";
}

function isTrainingFocus(value: unknown): value is TrainingFocus {
  return (
    value === "accuracy" ||
    value === "consistency" ||
    value === "intensity"
  );
}

function isEnrollmentStatus(value: unknown): value is TrainingEnrollmentStatus {
  return value === "active" || value === "completed";
}

export function parseTrainingStep(value: unknown): TrainingStep | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    typeof row.durationMinutes !== "number" ||
    !Number.isFinite(row.durationMinutes)
  ) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    durationMinutes: row.durationMinutes,
  };
}

export function parseTrainingPlan(value: unknown): TrainingPlan | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.title !== "string" ||
    !isTrainingSport(row.sport) ||
    typeof row.totalDurationMinutes !== "number" ||
    !Number.isFinite(row.totalDurationMinutes) ||
    !Array.isArray(row.steps)
  ) {
    return null;
  }
  if (row.focus !== null && row.focus !== undefined && !isTrainingFocus(row.focus)) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    sport: row.sport,
    focus: isTrainingFocus(row.focus) ? row.focus : null,
    steps: row.steps
      .map(parseTrainingStep)
      .filter((item): item is TrainingStep => !!item),
    totalDurationMinutes: row.totalDurationMinutes,
  };
}

export function parseTrainingEnrollment(
  value: unknown,
): TrainingEnrollment | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.planId !== "string" ||
    !isEnrollmentStatus(row.status) ||
    !Array.isArray(row.completedStepIds) ||
    typeof row.percentComplete !== "number" ||
    !Number.isFinite(row.percentComplete) ||
    typeof row.currentStepIndex !== "number" ||
    !Number.isFinite(row.currentStepIndex) ||
    typeof row.startedAt !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    planId: row.planId,
    status: row.status,
    completedStepIds: row.completedStepIds.filter(
      (id): id is string => typeof id === "string",
    ),
    percentComplete: row.percentComplete,
    currentStepIndex: row.currentStepIndex,
    startedAt: row.startedAt,
    updatedAt: row.updatedAt,
    completedAt: typeof row.completedAt === "string" ? row.completedAt : null,
  };
}

export function parseTrainingSnapshot(body: unknown): TrainingSnapshot {
  if (!body || typeof body !== "object") {
    return emptyTrainingSnapshot();
  }
  const row = body as Record<string, unknown>;
  return {
    plans: Array.isArray(row.plans)
      ? row.plans
          .map(parseTrainingPlan)
          .filter((item): item is TrainingPlan => !!item)
      : [],
    enrollments: Array.isArray(row.enrollments)
      ? row.enrollments
          .map(parseTrainingEnrollment)
          .filter((item): item is TrainingEnrollment => !!item)
      : [],
  };
}

export function emptyTrainingSnapshot(): TrainingSnapshot {
  return { plans: [], enrollments: [] };
}

/** Migration lag / unconfigured API — treat as empty, never crash the hub. */
export function isTrainingSoftFailure(status: number): boolean {
  return status === 0 || status === 404 || status === 503;
}

export function formatTrainingFocus(focus: TrainingFocus | null): string {
  if (focus === "accuracy") return "Accuracy";
  if (focus === "consistency") return "Consistency";
  if (focus === "intensity") return "Intensity";
  return "Padel";
}

export function formatDurationMinutes(minutes: number): string {
  return minutes === 1 ? "1 min" : `${minutes} min`;
}

export function planById(
  plans: ReadonlyArray<TrainingPlan>,
  planId: string,
): TrainingPlan | null {
  return plans.find((plan) => plan.id === planId) ?? null;
}

export function preferredPlan(
  plans: ReadonlyArray<TrainingPlan>,
): TrainingPlan | null {
  return planById(plans, PREFERRED_PLAN_ID) ?? plans[0] ?? null;
}

export function activeEnrollment(
  enrollments: ReadonlyArray<TrainingEnrollment>,
  planId?: string,
): TrainingEnrollment | null {
  const active = enrollments.filter((row) => row.status === "active");
  if (planId) {
    return active.find((row) => row.planId === planId) ?? null;
  }
  return active[0] ?? null;
}

export function completedEnrollments(
  enrollments: ReadonlyArray<TrainingEnrollment>,
): TrainingEnrollment[] {
  return enrollments.filter((row) => row.status === "completed");
}

export function catalogPlans(
  plans: ReadonlyArray<TrainingPlan>,
): TrainingPlan[] {
  return [...plans].sort((a, b) => {
    if (a.id === PREFERRED_PLAN_ID) return -1;
    if (b.id === PREFERRED_PLAN_ID) return 1;
    return 0;
  });
}

export function currentStep(
  plan: TrainingPlan,
  enrollment: TrainingEnrollment,
): TrainingStep | null {
  return plan.steps[enrollment.currentStepIndex] ?? null;
}

/** Union completed ids in plan order, then append unknown ids (server still unions). */
export function unionCompletedStepIds(
  plan: TrainingPlan | null,
  existing: ReadonlyArray<string>,
  nextStepId: string,
): string[] {
  const seen = new Set(existing);
  seen.add(nextStepId);
  if (!plan) return [...seen];
  const ordered = plan.steps.map((step) => step.id).filter((id) => seen.has(id));
  for (const id of seen) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

export function upsertEnrollment(
  enrollments: ReadonlyArray<TrainingEnrollment>,
  next: TrainingEnrollment,
): TrainingEnrollment[] {
  const rest = enrollments.filter((row) => row.id !== next.id);
  if (next.status === "active") {
    return [next, ...rest];
  }
  return [
    ...rest.filter((row) => row.status === "active"),
    next,
    ...rest.filter((row) => row.status !== "active"),
  ];
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function listTrainingPlansWith(
  deps: TrainingDeps,
): Promise<TrainingResult<TrainingSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, plansUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load training (${res.status})`,
        status: res.status,
      };
    }

    return { ok: true, value: parseTrainingSnapshot(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach training API", status: 0 };
  }
}

export async function enrollInPlanWith(
  planId: string,
  deps: TrainingDeps,
): Promise<TrainingResult<EnrollResult>> {
  const trimmed = planId.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing plan id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, enrollmentsUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify({ planId: trimmed }),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not start training plan"),
        status: res.status,
      };
    }

    const enrollment = parseTrainingEnrollment(
      body && typeof body === "object"
        ? (body as { enrollment?: unknown }).enrollment
        : null,
    );
    if (!enrollment) {
      return { ok: false, error: "Unexpected training response", status: 500 };
    }
    const resumed =
      typeof body === "object" &&
      body !== null &&
      (body as { resumed?: unknown }).resumed === true;

    return {
      ok: true,
      value: {
        enrollment,
        resumed,
      },
    };
  } catch {
    return { ok: false, error: "Could not reach training API", status: 0 };
  }
}

function advancePayload(input: AdvanceEnrollmentInput): unknown | null {
  const hasSteps = Array.isArray(input.completedStepIds);
  const hasPercent = typeof input.percentComplete === "number";
  if (hasSteps === hasPercent) return null;
  if (hasSteps) return { completedStepIds: input.completedStepIds };
  return { percentComplete: input.percentComplete };
}

export async function advanceEnrollmentWith(
  id: string,
  input: AdvanceEnrollmentInput,
  deps: TrainingDeps,
): Promise<TrainingResult<TrainingEnrollment>> {
  const trimmed = id.trim();
  const payload = advancePayload(input);
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing enrollment id", status: 400 };
  }
  if (!payload) {
    return {
      ok: false,
      error: "provide completedStepIds or percentComplete, not both",
      status: 400,
    };
  }

  try {
    const res = await invokeFetch(deps.fetch, enrollmentUrl(deps.baseUrl, trimmed), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(payload),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not update training progress"),
        status: res.status,
      };
    }

    const enrollment = parseTrainingEnrollment(
      body && typeof body === "object"
        ? (body as { enrollment?: unknown }).enrollment
        : null,
    );
    if (!enrollment) {
      return { ok: false, error: "Unexpected training response", status: 500 };
    }
    return { ok: true, value: enrollment };
  } catch {
    return { ok: false, error: "Could not reach training API", status: 0 };
  }
}

export async function listTrainingPlansResult(options: {
  cookie?: string;
} = {}): Promise<TrainingResult<TrainingSnapshot>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listTrainingPlansWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: empty snapshot on 401 / 404 / 503 / network failure. */
export async function listTrainingPlans(options: {
  cookie?: string;
} = {}): Promise<TrainingSnapshot> {
  const result = await listTrainingPlansResult(options);
  return result.ok ? result.value : emptyTrainingSnapshot();
}

export async function enrollInPlan(
  planId: string,
): Promise<TrainingResult<EnrollResult>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await enrollInPlanWith(planId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach training API", status: 0 };
  }
}

export async function advanceEnrollment(
  id: string,
  input: AdvanceEnrollmentInput,
): Promise<TrainingResult<TrainingEnrollment>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await advanceEnrollmentWith(id, input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach training API", status: 0 };
  }
}
