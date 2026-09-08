"use client";

import {
  featureStatusLabel,
  isShippedFeature,
  notifyRoadmapFeature,
  shouldCollapseDescription,
  toggleRoadmapVote,
  applyVoteResult,
  type PublicRoadmapFeature,
} from "@/lib/roadmap/roadmap";
import { Bell, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type FormEvent } from "react";

const STATUS_PILL: Record<PublicRoadmapFeature["status"], string> = {
  PLANNED: "border-white/12 bg-white/6 text-zinc-300",
  IN_PROGRESS: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  SHIPPED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

type FeatureCardProps = {
  feature: PublicRoadmapFeature;
  watching: boolean;
  onChange: (next: PublicRoadmapFeature) => void;
  onWatching: (featureId: string) => void;
};

export function FeatureCard({
  feature,
  watching,
  onChange,
  onWatching,
}: FeatureCardProps) {
  const shipped = isShippedFeature(feature);
  const long = shouldCollapseDescription(feature.description);
  const [expanded, setExpanded] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [votePending, setVotePending] = useState(false);
  const [notifyPending, setNotifyPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onVote() {
    if (shipped || votePending) return;
    setError(null);
    setVotePending(true);
    const result = await toggleRoadmapVote(feature.slug || feature.id);
    setVotePending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(applyVoteResult(feature, result.value));
  }

  async function onNotify(event: FormEvent) {
    event.preventDefault();
    if (shipped || notifyPending) return;
    setError(null);
    setNotifyPending(true);
    const result = await notifyRoadmapFeature(
      feature.slug || feature.id,
      email,
    );
    setNotifyPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotifyOpen(false);
    onWatching(feature.id);
  }

  return (
    <article className="min-w-0 rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${STATUS_PILL[feature.status]}`}
          >
            {featureStatusLabel(feature.status)}
          </span>
          <h3 className="mt-3 font-display text-2xl tracking-wide text-white">
            {feature.title}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed text-zinc-400 ${
              long && !expanded ? "line-clamp-3" : ""
            }`}
          >
            {feature.description}
          </p>
          {long ? (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-300 hover:text-emerald-200"
            >
              {expanded ? "Less" : "More"}
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => void onVote()}
            disabled={shipped || votePending}
            aria-pressed={feature.viewerHasVoted}
            className={`inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:w-auto ${
              feature.viewerHasVoted
                ? "border border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                : "border border-white/12 bg-white/5 text-white hover:border-white/20"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {feature.viewerHasVoted ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden />
            ) : null}
            <span>Would make me join</span>
            <span className="tabular-nums text-zinc-400">
              {feature.voteCount}
            </span>
          </button>

          {shipped ? null : watching ? (
            <p className="inline-flex min-h-11 items-center gap-2 text-sm text-emerald-300">
              <Bell className="h-4 w-4 shrink-0" aria-hidden />
              We&apos;ll email you when this ships
            </p>
          ) : notifyOpen ? (
            <form onSubmit={(event) => void onNotify(event)} className="min-w-0">
              <label
                htmlFor={`notify-${feature.id}`}
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Email me when this ships
              </label>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                <input
                  id={`notify-${feature.id}`}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="min-h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
                />
                <button
                  type="submit"
                  disabled={notifyPending}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
                >
                  {notifyPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setNotifyOpen(true)}
              className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-200 hover:border-white/20 sm:w-auto"
            >
              <Bell className="h-4 w-4 shrink-0" aria-hidden />
              Email me when this ships
            </button>
          )}
        </div>

        {error ? (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
