"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  formatGolfHandicapIndex,
  parseGolfHandicapIndex,
} from "@/lib/golf/handicap";
import { patchGolfHandicapIndex } from "@/lib/golf/profile";

type GolfHandicapIndexFieldProps = {
  heading?: string;
  description?: string;
};

export function GolfHandicapIndexField({
  heading = "Golf handicap index",
  description = "WHS Handicap Index from −10.0 to 54.0, one decimal. Leave blank to clear — rounds stay gross-only without it.",
}: GolfHandicapIndexFieldProps) {
  const { user, isAuthenticated, refresh } = useAuth();
  const [value, setValue] = useState(() =>
    formatGolfHandicapIndex(user?.golfHandicapIndex),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(formatGolfHandicapIndex(user?.golfHandicapIndex));
  }, [user?.golfHandicapIndex]);

  if (!isAuthenticated || !user?.id) {
    return (
      <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-4">
        <h3 className="text-sm font-semibold text-white">{heading}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
          Sign in to save a handicap index on your profile.
        </p>
      </div>
    );
  }

  const parsed = parseGolfHandicapIndex(value);
  const current = user.golfHandicapIndex ?? null;
  const next = parsed.ok ? parsed.value : current;
  const dirty = parsed.ok && next !== current;

  async function handleSave() {
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await patchGolfHandicapIndex(parsed.value);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(
      result.profile.golfHandicapIndex == null
        ? "Handicap index cleared. New rounds stay gross-only until you add one."
        : `Saved HI ${formatGolfHandicapIndex(result.profile.golfHandicapIndex)}.`,
    );
    await refresh();
  }

  return (
    <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-4">
      <h3 className="text-sm font-semibold text-white">{heading}</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
      <label className="mt-4 block">
        <span className="mb-1 block text-xs text-zinc-500">
          Handicap index
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
            setMessage(null);
          }}
          placeholder="e.g. 12.4"
          aria-invalid={parsed.ok ? undefined : true}
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
        />
      </label>
      {!parsed.ok ? (
        <p className="mt-2 text-xs text-amber-200">{parsed.error}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      {message ? (
        <p className="mt-2 text-xs text-emerald-300">{message}</p>
      ) : null}
      <button
        type="button"
        disabled={!dirty || saving || !parsed.ok}
        onClick={() => void handleSave()}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {saving
          ? "Saving…"
          : parsed.ok && parsed.value == null
            ? "Clear handicap"
            : "Save handicap"}
      </button>
    </div>
  );
}
