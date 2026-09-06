import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  activeEnrollment,
  advanceEnrollmentWith,
  catalogPlans,
  completedEnrollments,
  emptyTrainingSnapshot,
  enrollInPlanWith,
  formatDurationMinutes,
  formatTrainingFocus,
  isTrainingSoftFailure,
  listTrainingPlansWith,
  parseTrainingEnrollment,
  parseTrainingPlan,
  parseTrainingSnapshot,
  PREFERRED_PLAN_ID,
  unionCompletedStepIds,
  upsertEnrollment,
  type TrainingEnrollment,
  type TrainingPlan,
} from "./training.ts";

const ACCURACY_PLAN: TrainingPlan = {
  id: "accuracy-focus",
  title: "Accuracy Focus",
  sport: "padel",
  focus: "accuracy",
  steps: [
    { id: "warm-up", name: "Warm-up", durationMinutes: 10 },
    { id: "target-practice", name: "Target Practice", durationMinutes: 20 },
    { id: "precision-drills", name: "Precision Drills", durationMinutes: 15 },
    { id: "cool-down", name: "Cool-down", durationMinutes: 5 },
  ],
  totalDurationMinutes: 50,
};

const CONSISTENCY_PLAN: TrainingPlan = {
  id: "consistency-builder",
  title: "Consistency Builder",
  sport: "padel",
  focus: "consistency",
  steps: [
    { id: "rallies", name: "Rallies", durationMinutes: 20 },
    { id: "serve-return", name: "Serve & return", durationMinutes: 15 },
  ],
  totalDurationMinutes: 35,
};

const ACTIVE_ENROLLMENT: TrainingEnrollment = {
  id: "enr-1",
  planId: "accuracy-focus",
  status: "active",
  completedStepIds: ["warm-up"],
  percentComplete: 25,
  currentStepIndex: 1,
  startedAt: "2026-09-06T08:00:00.000Z",
  updatedAt: "2026-09-06T08:10:00.000Z",
  completedAt: null,
};

const COMPLETED_ENROLLMENT: TrainingEnrollment = {
  ...ACTIVE_ENROLLMENT,
  id: "enr-done",
  status: "completed",
  completedStepIds: [
    "warm-up",
    "target-practice",
    "precision-drills",
    "cool-down",
  ],
  percentComplete: 100,
  currentStepIndex: 4,
  completedAt: "2026-09-06T09:00:00.000Z",
};

describe("training parsers", () => {
  it("parses a catalog plan and never invents steps", () => {
    const parsed = parseTrainingPlan(ACCURACY_PLAN);
    assert.deepEqual(parsed, ACCURACY_PLAN);
    assert.equal(parseTrainingPlan({ ...ACCURACY_PLAN, sport: "golf" }), null);
    assert.equal(parseTrainingPlan({ ...ACCURACY_PLAN, steps: undefined }), null);
    assert.equal(parseTrainingPlan({ ...ACCURACY_PLAN, focus: "power" }), null);
  });

  it("parses enrollments and treats missing percent as invalid", () => {
    const parsed = parseTrainingEnrollment(ACTIVE_ENROLLMENT);
    assert.deepEqual(parsed, ACTIVE_ENROLLMENT);
    assert.equal(
      parseTrainingEnrollment({ ...ACTIVE_ENROLLMENT, percentComplete: undefined }),
      null,
    );
    assert.equal(
      parseTrainingEnrollment({ ...ACTIVE_ENROLLMENT, status: "paused" }),
      null,
    );
  });

  it("parses a GET snapshot and drops malformed rows", () => {
    const snapshot = parseTrainingSnapshot({
      plans: [ACCURACY_PLAN, { id: "bad" }],
      enrollments: [ACTIVE_ENROLLMENT, { planId: "x" }],
    });
    assert.equal(snapshot.plans.length, 1);
    assert.equal(snapshot.enrollments.length, 1);
    assert.deepEqual(parseTrainingSnapshot(null), emptyTrainingSnapshot());
  });

  it("formats focus and duration from API values", () => {
    assert.equal(formatTrainingFocus("accuracy"), "Accuracy");
    assert.equal(formatTrainingFocus("consistency"), "Consistency");
    assert.equal(formatTrainingFocus(null), "Padel");
    assert.equal(formatDurationMinutes(1), "1 min");
    assert.equal(formatDurationMinutes(50), "50 min");
  });

  it("highlights accuracy-focus first without inventing catalog rows", () => {
    const ordered = catalogPlans([CONSISTENCY_PLAN, ACCURACY_PLAN]);
    assert.equal(ordered[0]?.id, PREFERRED_PLAN_ID);
    assert.equal(catalogPlans([]).length, 0);
  });

  it("picks the first active enrollment and completed history", () => {
    const rows = [COMPLETED_ENROLLMENT, ACTIVE_ENROLLMENT];
    assert.equal(activeEnrollment(rows)?.id, "enr-1");
    assert.equal(activeEnrollment(rows, "consistency-builder"), null);
    assert.equal(completedEnrollments(rows)[0]?.id, "enr-done");
  });

  it("unions completed step ids in plan order", () => {
    assert.deepEqual(
      unionCompletedStepIds(ACCURACY_PLAN, ["warm-up"], "precision-drills"),
      ["warm-up", "precision-drills"],
    );
  });

  it("upserts the active enrollment to the front", () => {
    const next = upsertEnrollment(
      [COMPLETED_ENROLLMENT],
      { ...ACTIVE_ENROLLMENT, percentComplete: 50 } satisfies TrainingEnrollment,
    );
    assert.equal(next[0]?.id, "enr-1");
    assert.equal(next[0]?.percentComplete, 50);
    assert.equal(next[1]?.id, "enr-done");
  });
});

describe("training client", () => {
  it("lists plans and enrollments from GET /api/me/training/plans", async () => {
    const result = await listTrainingPlansWith({
      fetch: async (url) => {
        assert.match(String(url), /\/api\/me\/training\/plans$/);
        return new Response(
          JSON.stringify({
            plans: [ACCURACY_PLAN],
            enrollments: [ACTIVE_ENROLLMENT],
          }),
          { status: 200 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.plans[0]?.id, "accuracy-focus");
    assert.equal(result.value.enrollments[0]?.percentComplete, 25);
  });

  it("soft-fails list on 401 / 404 / 503 / network instead of throwing", async () => {
    const guest = await listTrainingPlansWith({
      fetch: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(guest.ok, false);
    if (!guest.ok) assert.equal(guest.status, 401);

    const missing = await listTrainingPlansWith({
      fetch: async () => new Response("not migrated", { status: 404 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.equal(missing.status, 404);
      assert.equal(isTrainingSoftFailure(missing.status), true);
    }

    const down = await listTrainingPlansWith({
      fetch: async () => new Response("nope", { status: 503 }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(down.ok, false);
    if (!down.ok) {
      assert.equal(down.status, 503);
      assert.equal(isTrainingSoftFailure(down.status), true);
    }

    const network = await listTrainingPlansWith({
      fetch: async () => {
        throw new Error("offline");
      },
      baseUrl: "https://api.example.test",
    });
    assert.equal(network.ok, false);
    if (!network.ok) {
      assert.equal(network.status, 0);
      assert.equal(isTrainingSoftFailure(network.status), true);
    }
  });

  it("POSTs enroll with planId and treats 201 as new", async () => {
    let sawBody = "";
    const result = await enrollInPlanWith("accuracy-focus", {
      fetch: async (url, init) => {
        assert.match(String(url), /\/api\/me\/training\/enrollments$/);
        assert.equal(init?.method, "POST");
        sawBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({ enrollment: ACTIVE_ENROLLMENT, resumed: false }),
          { status: 201 },
        );
      },
      baseUrl: "https://api.example.test",
    });

    assert.equal(sawBody, JSON.stringify({ planId: "accuracy-focus" }));
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.resumed, false);
    assert.equal(result.value.enrollment.planId, "accuracy-focus");
  });

  it("treats 200 enroll as resume of the active enrollment", async () => {
    const result = await enrollInPlanWith("accuracy-focus", {
      fetch: async () =>
        new Response(
          JSON.stringify({ enrollment: ACTIVE_ENROLLMENT, resumed: true }),
          { status: 200 },
        ),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.resumed, true);
  });

  it("PATCHes completedStepIds (preferred) and rejects both fields locally", async () => {
    let sawBody = "";
    const advanced = await advanceEnrollmentWith(
      "enr-1",
      { completedStepIds: ["warm-up", "target-practice"] },
      {
        fetch: async (url, init) => {
          assert.match(String(url), /\/api\/me\/training\/enrollments\/enr-1$/);
          assert.equal(init?.method, "PATCH");
          sawBody = String(init?.body ?? "");
          return new Response(
            JSON.stringify({
              enrollment: {
                ...ACTIVE_ENROLLMENT,
                completedStepIds: ["warm-up", "target-practice"],
                percentComplete: 50,
                currentStepIndex: 2,
              },
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );

    assert.equal(
      sawBody,
      JSON.stringify({ completedStepIds: ["warm-up", "target-practice"] }),
    );
    assert.equal(advanced.ok, true);
    if (advanced.ok) assert.equal(advanced.value.percentComplete, 50);

    const both = await advanceEnrollmentWith(
      "enr-1",
      { completedStepIds: ["warm-up"], percentComplete: 50 } as never,
      {
        fetch: async () => {
          throw new Error("should not fetch");
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(both.ok, false);
    if (!both.ok) assert.equal(both.status, 400);
  });

  it("PATCHes percentComplete as an alternative advance", async () => {
    let sawBody = "";
    const result = await advanceEnrollmentWith(
      "enr-1",
      { percentComplete: 50 },
      {
        fetch: async (_url, init) => {
          sawBody = String(init?.body ?? "");
          return new Response(
            JSON.stringify({
              enrollment: { ...ACTIVE_ENROLLMENT, percentComplete: 50 },
            }),
            { status: 200 },
          );
        },
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(sawBody, JSON.stringify({ percentComplete: 50 }));
    assert.equal(result.ok, true);
  });

  it("surfaces 401 enroll and 409 regress-completed", async () => {
    const unauth = await enrollInPlanWith("accuracy-focus", {
      fetch: async () =>
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(unauth.ok, false);
    if (!unauth.ok) assert.equal(unauth.status, 401);

    const blocked = await advanceEnrollmentWith(
      "enr-done",
      { percentComplete: 50 },
      {
        fetch: async () =>
          new Response(
            JSON.stringify({ error: "Training enrollment is already completed" }),
            { status: 409 },
          ),
        baseUrl: "https://api.example.test",
      },
    );
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 409);
      assert.equal(blocked.error, "Training enrollment is already completed");
    }
  });

  it("surfaces 404 unknown plan without throwing", async () => {
    const result = await enrollInPlanWith("missing-plan", {
      fetch: async () =>
        new Response(JSON.stringify({ error: "Training plan not found" }), {
          status: 404,
        }),
      baseUrl: "https://api.example.test",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 404);
      assert.equal(result.error, "Training plan not found");
    }
  });
});
