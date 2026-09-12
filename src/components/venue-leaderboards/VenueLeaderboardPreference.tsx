"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  getPreferences,
  updatePreferences,
} from "@/lib/preferences/preferences";
import {
  appearOnVenueLeaderboardsPutBody,
  VENUE_LEADERBOARD_OPT_OUT_LABEL,
} from "@/lib/venue-leaderboards/boards";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function VenueLeaderboardPreference() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [appear, setAppear] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    void getPreferences().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setAppear(result.preferences.appearOnVenueLeaderboards);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  if (!isAuthenticated) return null;

  async function handleToggle(next: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await updatePreferences(
      appearOnVenueLeaderboardsPutBody(next),
    );
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAppear(result.preferences.appearOnVenueLeaderboards);
    setMessage(
      result.preferences.appearOnVenueLeaderboards
        ? "You’ll appear on venue leaderboards."
        : "You’re hidden from venue leaderboards.",
    );
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-4">
      <h3 className="text-sm font-semibold text-white">
        {VENUE_LEADERBOARD_OPT_OUT_LABEL}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
        When off, your name stays off records, player of the month, grinder,
        and streak boards at every venue.
      </p>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={appear}
          disabled={!loaded || saving}
          onChange={(event) => void handleToggle(event.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-transparent text-emerald-400 focus:ring-emerald-400/40"
        />
        <span className="text-sm text-zinc-200">
          {appear ? "On — you can appear on boards" : "Off — hidden from boards"}
        </span>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" aria-hidden />
        ) : null}
      </label>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      {message ? (
        <p className="mt-2 text-xs text-emerald-300">{message}</p>
      ) : null}
    </div>
  );
}
