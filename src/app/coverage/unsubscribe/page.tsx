"use client";

import { buildCoverageUnsubscribePayload } from "@/lib/conversion/coverage";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function CoverageUnsubscribeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    const payload = buildCoverageUnsubscribePayload(token);
    if (!payload) {
      setError("This unsubscribe link is missing a token.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/intents/coverage/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error || "Could not unsubscribe. Try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the coverage list. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Coverage notify
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-white">
        Unsubscribe
      </h1>
      {done ? (
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          You&apos;re unsubscribed. We won&apos;t email you about new coverage.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Stop emails about new venues and coverage in your city.
          </p>
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={pending}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Unsubscribe"}
          </button>
          {error ? (
            <p className="mt-4 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function CoverageUnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md px-4 py-16 text-sm text-zinc-500">
            Loading…
          </div>
        }
      >
        <CoverageUnsubscribeForm />
      </Suspense>
    </div>
  );
}
