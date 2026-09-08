"use client";

import {
  featureStatusLabel,
  getRoadmapPreferences,
  removeRoadmapPreference,
  unsubscribeRoadmap,
  type PublicWatchingFeature,
} from "@/lib/roadmap/roadmap";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PreferencesClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [email, setEmail] = useState<string | null>(null);
  const [features, setFeatures] = useState<PublicWatchingFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [unsubscribed, setUnsubscribed] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void getRoadmapPreferences(token).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setEmail(result.value.email);
      setFeatures(result.value.features);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function stopWatching(featureId: string) {
    if (!token || busyId) return;
    setBusyId(featureId);
    setError(null);
    const result = await removeRoadmapPreference({ token, featureId });
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFeatures((current) => current.filter((row) => row.id !== featureId));
  }

  async function unsubscribeAll() {
    if (!token || busyId) return;
    setBusyId("all");
    setError(null);
    const result = await unsubscribeRoadmap(token);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setUnsubscribed(true);
    setFeatures([]);
    setEmail(result.value.email);
  }

  if (!token) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-zinc-400">
          Open the link from your email to manage what you&apos;re watching.
        </p>
        <Link
          href="/roadmap"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          Back to Roadmap
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading your watching list…</p>;
  }

  return (
    <div className="space-y-6">
      {unsubscribed ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/8 p-5 sm:p-6">
          <h2 className="font-display text-2xl tracking-wide text-white">
            You&apos;re unsubscribed
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {email ? `${email} ` : "You "}won&apos;t get roadmap emails unless
            you opt in again on a feature.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6">
            <h2 className="font-display text-2xl tracking-wide text-white">
              Email preferences
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {email
                ? `Watching as ${email}. Stop watching one feature, or unsubscribe from all roadmap emails.`
                : "Stop watching one feature, or unsubscribe from all roadmap emails."}
            </p>
            <button
              type="button"
              onClick={() => void unsubscribeAll()}
              disabled={busyId === "all"}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white hover:border-white/20 disabled:opacity-60"
            >
              {busyId === "all" ? "Unsubscribing…" : "Unsubscribe from all"}
            </button>
          </div>

          {features.length === 0 ? (
            <p className="text-sm text-zinc-500">
              You&apos;re not watching any features right now.
            </p>
          ) : (
            <ul className="space-y-2">
              {features.map((feature) => (
                <li
                  key={feature.id}
                  className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/8 bg-[#141814] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {featureStatusLabel(feature.status)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void stopWatching(feature.id)}
                    disabled={busyId === feature.id}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-zinc-200 hover:border-white/20 disabled:opacity-60"
                  >
                    {busyId === feature.id ? "Saving…" : "Stop watching"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}

      <Link
        href="/roadmap"
        className="inline-flex min-h-11 items-center text-sm font-medium text-emerald-300 hover:text-emerald-200"
      >
        Back to Roadmap
      </Link>
    </div>
  );
}
