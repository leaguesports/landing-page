import { cookies } from "next/headers";
import { getRailwayApiOrigin, isApiConfigured } from "@/lib/api-origin";
import type { AuthState, AuthUser } from "@/lib/api-client";

/**
 * Forward a Cookie header to Railway `/api/auth/me`.
 * Used by RSC (`getServerAuthState`) and Next API routes that stay on this app.
 */
export async function getAuthStateFromCookieHeader(
  cookieHeader: string | null | undefined,
): Promise<AuthState> {
  if (!isApiConfigured()) {
    return {
      isAuthenticated: false,
      user: null,
      error: "API URL is not configured",
    };
  }

  const origin = getRailwayApiOrigin();
  if (!origin) {
    return { isAuthenticated: false, user: null, error: null };
  }

  const cookie = (cookieHeader ?? "").trim();

  try {
    const res = await fetch(`${origin}/api/auth/me`, {
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    });

    if (res.status === 401) {
      return { isAuthenticated: false, user: null, error: null };
    }

    if (res.status === 204) {
      return { isAuthenticated: true, user: null, error: null };
    }

    if (res.ok) {
      const user = (await res.json()) as AuthUser;
      if (user?.id) {
        return { isAuthenticated: true, user, error: null };
      }
      return { isAuthenticated: true, user: null, error: null };
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
      error: "Could not reach the API",
    };
  }
}

/**
 * Server-side session check for RSC (home dashboard gate).
 * Forwards the request cookie jar to Railway `/api/auth/me`.
 */
export async function getServerAuthState(): Promise<AuthState> {
  const cookieStore = await cookies();
  return getAuthStateFromCookieHeader(cookieStore.toString());
}
