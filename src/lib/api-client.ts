import { getRailwayApiOrigin, isApiConfigured } from "@/lib/api-origin";
import { getSiteBaseUrl } from "@/lib/site-url";

export { isApiConfigured } from "@/lib/api-origin";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getSiteBaseUrl();
}

/**
 * Browser calls use same-origin `/api/*` (proxied to Railway in next.config).
 * Server-side calls go to the Railway origin directly.
 * This keeps auth cookies first-party on leaguesports.co.za.
 *
 * Do not fetch `getRailwayApiOrigin()` from the browser — that bypasses
 * the first-party `/api` proxy and breaks OAuth cookies.
 */
function getRequestBase(): string {
  if (typeof window !== "undefined") {
    return getSiteOrigin();
  }
  return getRailwayApiOrigin();
}

function toAbsoluteReturnTo(returnTo: string): string {
  if (returnTo.startsWith("http")) {
    return returnTo;
  }
  return `${getSiteOrigin()}${returnTo.startsWith("/") ? returnTo : `/${returnTo}`}`;
}

export async function poolApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(0, "API URL is not configured");
  }

  const res = await fetch(`${getRequestBase()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export interface AuthUser {
  id: string;
  displayName?: string;
  email?: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
}

export async function getAuthState(): Promise<AuthState> {
  if (!isApiConfigured()) {
    return {
      isAuthenticated: false,
      user: null,
      error: "API URL is not configured",
    };
  }

  try {
    const res = await fetch(`${getRequestBase()}/api/auth/me`, {
      credentials: "include",
    });

    if (res.status === 401) {
      return { isAuthenticated: false, user: null, error: null };
    }

    if (res.status === 204) {
      return { isAuthenticated: true, user: null, error: null };
    }

    if (res.ok) {
      try {
        const user = (await res.json()) as AuthUser;
        return { isAuthenticated: true, user, error: null };
      } catch {
        return { isAuthenticated: true, user: null, error: null };
      }
    }

    return {
      isAuthenticated: false,
      user: null,
      error: `Auth check failed (${res.status})`,
    };
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      error: "Could not reach the API. Check your connection or try again.",
    };
  }
}

export function getGoogleSignInUrl(returnTo?: string): string {
  if (!isApiConfigured()) {
    return "";
  }

  const url = new URL(`${getSiteOrigin()}/api/auth/providers/google/signin`);
  if (returnTo) {
    url.searchParams.set("returnTo", toAbsoluteReturnTo(returnTo));
  }
  return url.toString();
}

export async function logout(): Promise<void> {
  await poolApi("/api/auth/logout", { method: "POST" });
}
