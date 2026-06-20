"use client";

import { ApiError } from "@/lib/api-client";
import { joinPool } from "@/lib/pool-api";
import { setGuestMemberId } from "@/lib/pool-storage";
import { useState } from "react";

export default function JoinForm({
  inviteCode,
  defaultDisplayName = "",
  isAuthenticated,
  onJoined,
}: {
  inviteCode: string;
  defaultDisplayName?: string;
  isAuthenticated: boolean;
  onJoined: (memberId: string) => void;
}) {
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      const member = await joinPool(inviteCode, trimmed);
      setGuestMemberId(inviteCode, member.id);
      onJoined(member.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not join pool. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
    >
      <h2 className="text-lg font-bold text-white">Join this pool</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {isAuthenticated
          ? "Enter your display name to join. Your account will be linked."
          : "No login required — just pick a name and predict."}
      </p>

      <div className="mt-4">
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Brandon"
          maxLength={50}
          className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Joining…" : "Join pool"}
      </button>
    </form>
  );
}
