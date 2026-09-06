"use client";

import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  activeEnrollment,
  advanceEnrollment,
  catalogPlans,
  completedEnrollments,
  currentStep,
  enrollInPlan,
  formatDurationMinutes,
  formatTrainingFocus,
  planById,
  PREFERRED_PLAN_ID,
  unionCompletedStepIds,
  upsertEnrollment,
  type TrainingEnrollment,
  type TrainingPlan,
  type TrainingSnapshot,
} from "@/lib/training/training";
import { Check, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

type TrainingPanelProps = {
  initial: TrainingSnapshot;
  className?: string;
  /** When false, skip the panel eyebrow (parent already titled the section). */
  showHeading?: boolean;
  /** Server-known session. Hub is always signed-in; `/training` passes this for guests. */
  guest?: boolean;
};

function sendToLogin() {
  const returnTo = relativeAuthReturnTo();
  window.location.href = getLoginPageHref(returnTo || "/training");
}

function planTitle(plans: TrainingPlan[], planId: string): string {
  return planById(plans, planId)?.title ?? planId;
}

function formatCompletedAt(value: string | null): string {
  if (!value) return "Completed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Completed";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function TrainingPanel({
  initial,
  className = "mt-8",
  showHeading = true,
  guest = false,
}: TrainingPanelProps) {
  const [plans, setPlans] = useState<TrainingPlan[]>(initial.plans);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>(
    initial.enrollments,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = activeEnrollment(enrollments);
  const activePlan = active ? planById(plans, active.planId) : null;
  const history = completedEnrollments(enrollments);
  const catalog = catalogPlans(plans);
  const preferred = planById(plans, PREFERRED_PLAN_ID);

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function applyEnrollment(next: TrainingEnrollment, extraPlans?: TrainingPlan[]) {
    if (extraPlans && extraPlans.length > 0) {
      setPlans((current) => {
        const seen = new Set(current.map((plan) => plan.id));
        return [
          ...current,
          ...extraPlans.filter((plan) => !seen.has(plan.id)),
        ];
      });
    }
    setEnrollments((current) => upsertEnrollment(current, next));
  }

  function onEnroll(planId: string, restart = false) {
    clearFeedback();
    if (guest) {
      sendToLogin();
      return;
    }

    startTransition(() => {
      void enrollInPlan(planId).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        applyEnrollment(result.value.enrollment);
        if (restart) {
          setMessage("Restarted — first drill is ready.");
        } else if (result.value.resumed) {
          setMessage("Picked up where you left off.");
        } else {
          setMessage("Plan started.");
        }
      });
    });
  }

  function onCompleteStep(enrollment: TrainingEnrollment, stepId: string) {
    clearFeedback();
    if (guest) {
      sendToLogin();
      return;
    }

    const plan = planById(plans, enrollment.planId);
    const completedStepIds = unionCompletedStepIds(
      plan,
      enrollment.completedStepIds,
      stepId,
    );

    startTransition(() => {
      void advanceEnrollment(enrollment.id, { completedStepIds }).then(
        (result) => {
          if (!result.ok) {
            if (result.status === 401) {
              sendToLogin();
              return;
            }
            setError(result.error);
            return;
          }
          applyEnrollment(result.value);
          setMessage(
            result.value.status === "completed"
              ? "Plan complete."
              : "Step logged.",
          );
        },
      );
    });
  }

  const nextStep = active && activePlan ? currentStep(activePlan, active) : null;

  return (
    <section className={className} aria-labelledby="hub-training">
      {showHeading ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
            <h3
              id="hub-training"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
            >
              Training
            </h3>
          </div>
          <Link
            href="/training"
            className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Open plans
          </Link>
        </div>
      ) : (
        <h3 id="hub-training" className="sr-only">
          Training
        </h3>
      )}

      {error ? (
        <p className="mb-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-3 text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}

      {guest ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Sign in to start a curated padel plan — progress stays on your
            account.
          </p>
          <button
            type="button"
            onClick={sendToLogin}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            Log in to train
          </button>
        </div>
      ) : active ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Active · {formatTrainingFocus(activePlan?.focus ?? null)}
          </p>
          <h4 className="mt-1 font-display text-2xl tracking-wide text-white">
            {planTitle(plans, active.planId)}
          </h4>
          {nextStep ? (
            <p className="mt-1 text-sm text-zinc-400">
              Up next: {nextStep.name} ·{" "}
              {formatDurationMinutes(nextStep.durationMinutes)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-400">
              Last drill — mark it done to complete the plan.
            </p>
          )}

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Progress</span>
              <span className="tabular-nums text-white">
                {Math.round(active.percentComplete)}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${Math.min(100, Math.max(0, active.percentComplete))}%`,
                }}
              />
            </div>
          </div>

          {activePlan && activePlan.steps.length > 0 ? (
            <ol className="mt-5 space-y-2">
              {activePlan.steps.map((step, index) => {
                const done = active.completedStepIds.includes(step.id);
                const current = index === active.currentStepIndex;
                return (
                  <li
                    key={step.id}
                    className={[
                      "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3",
                      done
                        ? "border-emerald-400/25 bg-emerald-400/10"
                        : current
                          ? "border-white/16 bg-[#101410]"
                          : "border-white/8 bg-[#141814]",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {step.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDurationMinutes(step.durationMinutes)}
                      </p>
                    </div>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Done
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onCompleteStep(active, step.id)}
                        className="shrink-0 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                      >
                        Mark done
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Steps will appear once the catalog loads.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No active plan. Start a curated padel session — Accuracy Focus is
            the default if you just want to begin.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => onEnroll(PREFERRED_PLAN_ID)}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
            >
              Start {preferred?.title ?? "Accuracy Focus"}
            </button>
            {catalog
              .filter((plan) => plan.id !== PREFERRED_PLAN_ID)
              .map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  disabled={pending}
                  onClick={() => onEnroll(plan.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-zinc-950 disabled:opacity-60"
                >
                  Start {plan.title}
                </button>
              ))}
          </div>
        </div>
      )}

      {!guest && catalog.length > 0 && active ? (
        <ul className="mt-4 space-y-2">
          {catalog
            .filter((plan) => plan.id !== active.planId)
            .map((plan) => (
              <li
                key={plan.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {plan.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatTrainingFocus(plan.focus)} ·{" "}
                    {formatDurationMinutes(plan.totalDurationMinutes)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onEnroll(plan.id)}
                  className="shrink-0 rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-60"
                >
                  Start
                </button>
              </li>
            ))}
        </ul>
      ) : null}

      {!guest && history.length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Completed
          </p>
          <ul className="space-y-2">
            {history.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {planTitle(plans, row.planId)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatCompletedAt(row.completedAt)} ·{" "}
                    {Math.round(row.percentComplete)}%
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onEnroll(row.planId, true)}
                  className="shrink-0 rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-60"
                >
                  Restart
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
