"use client";

import { createPool, PoolApiError } from "@/lib/pool-api";
import { savePoolMemberId } from "@/lib/pool-storage";
import { SCORING_RULES } from "@/lib/pool-utils";
import type { PoolScoringRule } from "@/types/pool";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SPORTS = ["rugby", "soccer", "cricket", "formula 1", "other"];

export default function CreatePoolForm() {
  const router = useRouter();
  const [hostDisplayName, setHostDisplayName] = useState("");
  const [name, setName] = useState("");
  const [scoringRule, setScoringRule] =
    useState<PoolScoringRule>("EXACT_SCORE_THREE_CORRECT_RESULT_ONE");
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState("rugby");
  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("15:00");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!hostDisplayName.trim()) {
      errors.hostDisplayName = "Your name is required";
    }
    if (!name.trim()) {
      errors.name = "Pool name is required";
    }
    if (!title.trim()) {
      errors.title = "Match title is required";
    }
    if (!homeTeamName.trim()) {
      errors.homeTeamName = "Home team is required";
    }
    if (!awayTeamName.trim()) {
      errors.awayTeamName = "Away team is required";
    }
    if (!matchDate) {
      errors.matchDate = "Match date is required";
    } else {
      const kickoff = new Date(`${matchDate}T${matchTime}:00`);
      if (kickoff.getTime() <= Date.now()) {
        errors.matchDate = "Kickoff must be in the future";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    const kickoff = new Date(`${matchDate}T${matchTime}:00`);

    setIsSubmitting(true);
    try {
      const pool = await createPool({
        name: name.trim(),
        hostDisplayName: hostDisplayName.trim(),
        scoringRule,
        fixture: {
          title: title.trim(),
          sport,
          homeTeamName: homeTeamName.trim(),
          awayTeamName: awayTeamName.trim(),
          matchDate: kickoff.toISOString(),
        },
      });

      const hostMember = pool.members[0];
      if (hostMember) {
        savePoolMemberId(pool.inviteCode, hostMember.id);
      }

      router.push(`/pools/join/${pool.inviteCode}`);
    } catch (err) {
      if (err instanceof PoolApiError) {
        setError(err.message);
      } else {
        setError("Could not create pool. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white">Your details</h2>

        <div className="mt-4">
          <label htmlFor="hostDisplayName" className="block text-sm font-medium text-zinc-300">
            Your name
          </label>
          <input
            id="hostDisplayName"
            type="text"
            value={hostDisplayName}
            onChange={(e) => setHostDisplayName(e.target.value)}
            placeholder="e.g. Brandon"
            maxLength={50}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
          />
          {fieldErrors.hostDisplayName && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.hostDisplayName}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white">Pool details</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="poolName" className="block text-sm font-medium text-zinc-300">
              Pool name
            </label>
            <input
              id="poolName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Friday braai predictions"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="scoringRule" className="block text-sm font-medium text-zinc-300">
              Scoring rule
            </label>
            <select
              id="scoringRule"
              value={scoringRule}
              onChange={(e) => setScoringRule(e.target.value as PoolScoringRule)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            >
              {(
                Object.entries(SCORING_RULES) as [
                  PoolScoringRule,
                  (typeof SCORING_RULES)[PoolScoringRule],
                ][]
              ).map(([key, rule]) => (
                <option key={key} value={key}>
                  {rule.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-zinc-500">
              {SCORING_RULES[scoringRule].description}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white">Match details</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="matchTitle" className="block text-sm font-medium text-zinc-300">
              Match title
            </label>
            <input
              id="matchTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Springboks vs All Blacks"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-zinc-300">
              Sport
            </label>
            <select
              id="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white capitalize focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            >
              {SPORTS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="homeTeam" className="block text-sm font-medium text-zinc-300">
                Home team
              </label>
              <input
                id="homeTeam"
                type="text"
                value={homeTeamName}
                onChange={(e) => setHomeTeamName(e.target.value)}
                placeholder="Springboks"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
              {fieldErrors.homeTeamName && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.homeTeamName}</p>
              )}
            </div>
            <div>
              <label htmlFor="awayTeam" className="block text-sm font-medium text-zinc-300">
                Away team
              </label>
              <input
                id="awayTeam"
                type="text"
                value={awayTeamName}
                onChange={(e) => setAwayTeamName(e.target.value)}
                placeholder="All Blacks"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
              {fieldErrors.awayTeamName && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.awayTeamName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="matchDate" className="block text-sm font-medium text-zinc-300">
                Kickoff date
              </label>
              <input
                id="matchDate"
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
              {fieldErrors.matchDate && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.matchDate}</p>
              )}
            </div>
            <div>
              <label htmlFor="matchTime" className="block text-sm font-medium text-zinc-300">
                Kickoff time
              </label>
              <input
                id="matchTime"
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full rounded-full bg-emerald-400 px-4 py-3.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating pool…" : "Create pool & get invite link"}
      </button>
    </form>
  );
}
