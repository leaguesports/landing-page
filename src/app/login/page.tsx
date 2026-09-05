"use client";

import { getGoogleSignInUrl } from "@/lib/api-client";
import { isApiConfigured } from "@/lib/api-origin";
import { stashAuthReturnTo } from "@/lib/auth-return-to";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function readSafeReturnTo(raw: string | null): string | undefined {
  if (!raw?.trim()) return undefined;
  try {
    const absolute = new URL(
      raw.startsWith("http") ? raw : raw.startsWith("/") ? raw : `/${raw}`,
      window.location.origin,
    );
    if (absolute.origin !== window.location.origin) return undefined;
    if (absolute.username || absolute.password) return undefined;
    const relative = `${absolute.pathname}${absolute.search}${absolute.hash}`;
    if (!relative.startsWith("/") || relative.startsWith("//")) return undefined;
    if (relative === "/login" || relative.startsWith("/login?")) return undefined;
    return relative;
  } catch {
    return undefined;
  }
}

function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);

  const returnTo = useMemo(
    () => readSafeReturnTo(searchParams.get("returnTo")),
    [searchParams],
  );

  const apiReady = isApiConfigured();
  const signInUrl = apiReady ? getGoogleSignInUrl(returnTo || "/") : "";

  useEffect(() => {
    stashAuthReturnTo(returnTo);
  }, [returnTo]);

  function handleGoogleLogin() {
    if (!signInUrl || busy) return;
    setBusy(true);
    stashAuthReturnTo(returnTo);
    window.location.href = signInUrl;
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-linear-to-br from-emerald-400/25 via-white/5 to-sky-400/15 opacity-80 blur-[1px]" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101410]/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/50 to-transparent" />

        <div className="animate-rise text-center">
          <p className="font-display text-[clamp(2.5rem,10vw,3.25rem)] leading-none tracking-wide text-white">
            LEAGUE
            <span className="text-[var(--color-brand)]">SPORTS</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Watch, play, and track sport in South Africa.
          </p>
        </div>

        <div className="animate-rise-delay mt-10 space-y-4">
          <h1 className="text-center text-xl font-semibold tracking-tight text-white">
            Log in to continue
          </h1>
          <p className="text-center text-sm leading-relaxed text-zinc-500">
            Follow venues and fixtures, lock scorecards, and keep your athlete
            hub in sync.
          </p>
        </div>

        <div className="animate-rise-delay-2 mt-8 space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={!signInUrl || busy}
            className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white py-3.5 text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <GoogleMark className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
            {busy ? "Redirecting…" : "Continue with Google"}
          </button>

          {!apiReady && (
            <p className="text-center text-xs leading-relaxed text-zinc-500">
              Sign in is unavailable. Set{" "}
              <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-zinc-400">
                API_ORIGIN
              </code>{" "}
              or{" "}
              <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-zinc-400">
                NEXT_PUBLIC_API_URL
              </code>{" "}
              to the Railway API origin.
            </p>
          )}

          <p className="text-center text-xs leading-relaxed text-zinc-600">
            By continuing you agree to our{" "}
            <Link
              href="/terms"
              className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="h-80 w-full max-w-md animate-pulse rounded-3xl border border-white/8 bg-[#141814]/80" />
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-8 right-[10%] h-80 w-80 rounded-full bg-sky-500/15 blur-3xl animate-float" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[4rem_4rem] animate-mesh opacity-70" />
        <div className="absolute inset-0 bg-linear-to-b from-[#0c0f0c]/30 via-transparent to-[#0c0f0c]" />
      </div>

      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
