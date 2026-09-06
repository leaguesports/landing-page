"use client";

import { getLoginPageHref, relativeAuthReturnTo } from "@/lib/auth-return-to";
import {
  buildSyncPayload,
  connectIntegration,
  disconnectIntegration,
  formatImportedSessionCount,
  formatLastSyncedAt,
  formatProviderStatus,
  formatSessionSport,
  INTEGRATION_SPORTS,
  syncIntegration,
  upsertProvider,
  type IntegrationProvider,
  type IntegrationSport,
  type IntegrationsSnapshot,
} from "@/lib/integrations/integrations";
import { Cable } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";

type IntegrationsPanelProps = {
  initial: IntegrationsSnapshot;
  className?: string;
  /** When false, skip the panel eyebrow (parent already titled the section). */
  showHeading?: boolean;
  /** Server-known session. Hub is always signed-in; `/integrations` passes this for guests. */
  guest?: boolean;
};

function sendToLogin() {
  const returnTo = relativeAuthReturnTo();
  window.location.href = getLoginPageHref(returnTo || "/integrations");
}

function toDatetimeLocalValue(iso?: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function SyncForm({
  providerId,
  pending,
  onSync,
}: {
  providerId: string;
  pending: boolean;
  onSync: (input: {
    sport: IntegrationSport;
    playedAt: string;
    title: string;
  }) => void;
}) {
  const [sport, setSport] = useState<IntegrationSport>("padel");
  const [playedAt, setPlayedAt] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    setPlayedAt((current) => current || toDatetimeLocalValue());
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    onSync({ sport, playedAt, title });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 space-y-3 border-t border-white/8 pt-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Import a session
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs text-zinc-400">
          Sport
          <select
            value={sport}
            onChange={(event) =>
              setSport(event.target.value as IntegrationSport)
            }
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
          >
            {INTEGRATION_SPORTS.map((value) => (
              <option key={value} value={value}>
                {formatSessionSport(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-400">
          Played at
          <input
            type="datetime-local"
            value={playedAt}
            onChange={(event) => setPlayedAt(event.target.value)}
            required
            className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
          />
        </label>
      </div>
      <label className="block text-xs text-zinc-400">
        Title <span className="text-zinc-600">(optional)</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Club night"
          className="mt-1 min-h-11 w-full rounded-2xl border border-white/10 bg-[#101410] px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
      >
        Sync session
      </button>
    </form>
  );
}

export function IntegrationsPanel({
  initial,
  className = "mt-8",
  showHeading = true,
  guest = false,
}: IntegrationsPanelProps) {
  const [providers, setProviders] = useState<IntegrationProvider[]>(
    initial.providers,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function applyProvider(next: IntegrationProvider) {
    setProviders((current) => upsertProvider(current, next));
  }

  function onConnect(providerId: string) {
    clearFeedback();
    if (guest) {
      sendToLogin();
      return;
    }

    startTransition(() => {
      void connectIntegration(providerId, {}).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        applyProvider(result.value);
        setMessage("Connected. Import a session to record a real last sync.");
      });
    });
  }

  function onDisconnect(providerId: string) {
    clearFeedback();
    if (guest) {
      sendToLogin();
      return;
    }

    startTransition(() => {
      void disconnectIntegration(providerId).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        applyProvider(result.value);
        setMessage("Disconnected.");
      });
    });
  }

  function onSync(
    providerId: string,
    input: { sport: IntegrationSport; playedAt: string; title: string },
  ) {
    clearFeedback();
    if (guest) {
      sendToLogin();
      return;
    }

    const payload = buildSyncPayload(input);
    if (!payload.ok) {
      setError(payload.error);
      return;
    }

    startTransition(() => {
      void syncIntegration(providerId, payload.value).then((result) => {
        if (!result.ok) {
          if (result.status === 401) {
            sendToLogin();
            return;
          }
          setError(result.error);
          return;
        }
        applyProvider(result.value);
        setMessage("Session imported.");
      });
    });
  }

  return (
    <section className={className} aria-labelledby="hub-connected-services">
      {showHeading ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cable className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
            <h3
              id="hub-connected-services"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
            >
              Connected services
            </h3>
          </div>
          <Link
            href="/integrations"
            className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Manage
          </Link>
        </div>
      ) : (
        <h3 id="hub-connected-services" className="sr-only">
          Connected services
        </h3>
      )}

      {error ? (
        <p className="mb-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-3 text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}

      {guest ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Sign in to connect Import session — last sync and import counts stay
            on your account. We only show services you can actually connect.
          </p>
          <button
            type="button"
            onClick={sendToLogin}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-300"
          >
            Log in to connect
          </button>
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            No connectable services yet. Import session will show here when the
            API is ready — we never invent an Active badge.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {providers.map((provider) => {
            const connected = provider.status === "connected";
            const lastSync = formatLastSyncedAt(provider.lastSyncedAt);
            const lastSession = provider.lastImportedSession;
            return (
              <li
                key={provider.id}
                className={[
                  "rounded-3xl border px-5 py-5",
                  connected
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-white/8 bg-[#141814]",
                ].join(" ")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-medium text-white">
                        {provider.name}
                      </h4>
                      <span
                        className={[
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
                          connected
                            ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border border-white/10 bg-white/5 text-zinc-400",
                        ].join(" ")}
                      >
                        {formatProviderStatus(provider.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {provider.description}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {lastSync ? `Last sync ${lastSync}` : "No sync yet"}
                      {" · "}
                      {formatImportedSessionCount(provider.importedSessionCount)}
                    </p>
                    {lastSession ? (
                      <p className="mt-1 text-xs text-zinc-400">
                        Last imported:{" "}
                        {lastSession.title ?? "Untitled session"} ·{" "}
                        {formatSessionSport(lastSession.sport)}
                      </p>
                    ) : null}
                  </div>
                  {connected ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onDisconnect(provider.id)}
                      className="shrink-0 rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:text-white disabled:opacity-60"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onConnect(provider.id)}
                      className="shrink-0 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {connected ? (
                  <SyncForm
                    providerId={provider.id}
                    pending={pending}
                    onSync={(input) => onSync(provider.id, input)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
