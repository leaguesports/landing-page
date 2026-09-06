"use client";

import { useAuth } from "@/hooks/useAuth";
import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  createPool,
  isPoolsUnavailable,
} from "@/lib/pools/pools";
import { buildPoolWhatsAppShare } from "@/lib/pools/whatsapp-share";
import { MessageCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

type FixturePoolPanelProps = {
  slug: string;
  fixtureTitle: string;
  kicksOffAt?: string | null;
};

function sendToLogin(slug: string) {
  const returnTo =
    (typeof window !== "undefined" && relativeAuthReturnTo()) ||
    `/events/${slug}`;
  window.location.href = getLoginPageHref(returnTo);
}

export function FixturePoolPanel({
  slug,
  fixtureTitle,
  kicksOffAt,
}: FixturePoolPanelProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [shareHref, setShareHref] = useState<string | null>(null);
  const [poolPath, setPoolPath] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      sendToLogin(slug);
      return;
    }

    startTransition(() => {
      void createPool({
        fixtureSlug: slug,
        title: title.trim() || `${fixtureTitle} tips`,
        kicksOffAt: kicksOffAt ?? null,
      }).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin(slug);
            return;
          }
          if (isPoolsUnavailable(result.status)) {
            setUnavailable(true);
            setError(
              "Prediction pools aren’t live on this environment yet. The share page still works once the API is deployed.",
            );
            return;
          }
          setError(result.error);
          return;
        }

        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "https://leaguesports.co.za";
        const share = buildPoolWhatsAppShare({
          inviteCode: result.value.inviteCode,
          fixtureTitle,
          poolTitle: result.value.title,
          origin,
        });
        setShareHref(share.href);
        setPoolPath(`/pools/${result.value.inviteCode}`);
        router.refresh();
      });
    });
  }

  return (
    <section
      className="rounded-3xl border border-white/8 bg-[#141814] p-5 sm:p-6"
      aria-labelledby="fixture-pool-heading"
    >
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-3.5 w-3.5 text-sky-300" aria-hidden />
        <h2
          id="fixture-pool-heading"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
        >
          Prediction pool
        </h2>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">
        Start a friends tip pool for this fixture. Share the link on WhatsApp —
        no money, just bragging rights before kickoff.
      </p>

      {unavailable ? (
        <p className="mt-4 text-sm text-zinc-500" role="status">
          {error}
        </p>
      ) : poolPath && shareHref ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-sky-200" role="status">
            Pool ready. Forward this link to friends.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-zinc-950 hover:bg-[#1ebe5d]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Share on WhatsApp
            </a>
            <Link
              href={poolPath}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950"
            >
              Open pool
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">
              Pool name (optional)
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              placeholder={`${fixtureTitle} tips`}
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#0c0f0c] px-3 text-sm text-white placeholder:text-zinc-600 focus:border-sky-400/60 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={pending || authLoading}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-400 hover:text-white disabled:opacity-60"
          >
            {pending
              ? "Creating…"
              : isAuthenticated
                ? "Create pool"
                : "Sign in to create"}
          </button>
          {error ? (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
