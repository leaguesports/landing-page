"use client";

import { track } from "@/lib/analytics/track";
import type { PageType } from "@/lib/analytics/track";
import {
  buildCoveragePayload,
  coverageHonestyCopy,
  parseCoverageIntentResponse,
} from "@/lib/conversion/coverage";
import { ROADMAP_HREF } from "@/lib/roadmap/roadmap";
import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";

export function CoverageNotify({
  sport,
  sportName,
  city,
  cityName,
  sourcePage,
  pageType,
  showRoadmap = true,
  trackFallbackOnView = false,
}: {
  sport?: string | null;
  sportName?: string | null;
  city?: string | null;
  cityName?: string | null;
  sourcePage?: string | null;
  pageType: PageType;
  showRoadmap?: boolean;
  /** Fire `conversion_fallback` once when thin coverage is shown. */
  trackFallbackOnView?: boolean;
}) {
  const emailFieldId = useId();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackFallbackOnView) return;
    track("conversion_fallback", {
      page_type: pageType,
      cta_slot: "empty",
      sport: sport ?? undefined,
      city: city ?? undefined,
    });
  }, [trackFallbackOnView, pageType, sport, city]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = buildCoveragePayload({
      email,
      sport,
      city: cityName || city,
      sourcePage,
    });
    if (!payload) {
      setError("Enter a valid email.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/intents/coverage", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          body && typeof body === "object" && "error" in body
            ? String((body as { error?: string }).error ?? "")
            : "";
        setError(message || "Could not save that. Try again.");
        track("conversion_fallback", {
          page_type: pageType,
          cta_slot: "empty",
          sport: sport ?? undefined,
          city: city ?? undefined,
        });
        return;
      }
      parseCoverageIntentResponse(body);
      setDone(true);
      track("generate_lead", {
        page_type: pageType,
        cta_slot: "empty",
        sport: sport ?? undefined,
        city: city ?? undefined,
      });
    } catch {
      setError("Could not reach the coverage list. Try again.");
      track("conversion_fallback", {
        page_type: pageType,
        cta_slot: "empty",
        sport: sport ?? undefined,
        city: city ?? undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6 sm:px-6 sm:py-7">
      <p className="text-sm leading-relaxed text-zinc-400">
        {coverageHonestyCopy({
          sportName: sportName || sport,
          cityName: cityName || city,
        })}
      </p>

      {done ? (
        <p className="mt-4 text-sm font-medium text-emerald-300" role="status">
          You&apos;re on the list. We&apos;ll email you when coverage lands.
        </p>
      ) : (
        <form onSubmit={(event) => void onSubmit(event)} className="mt-4">
          <label
            htmlFor={emailFieldId}
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Notify me when this is listed
          </label>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input
              id={emailFieldId}
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
              disabled={pending}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Notify me"}
            </button>
          </div>
        </form>
      )}

      {error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}

      {showRoadmap ? (
        <p className="mt-4 text-sm text-zinc-500">
          See what&apos;s next on the{" "}
          <Link
            href={ROADMAP_HREF}
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            roadmap
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
