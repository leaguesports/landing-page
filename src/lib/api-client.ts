const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function isApiConfigured(): boolean {
  return API_BASE.length > 0;
}

function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://leaguesports.co.za").replace(
    /\/$/,
    "",
  );
}

/**
 * Browser calls use same-origin `/api/*` (proxied to the backend in next.config).
 * This keeps auth cookies first-party on leaguesports.co.za.
 */
function getRequestBase(): string {
  if (typeof window !== "undefined") {
    return getSiteOrigin();
  }
  return API_BASE;
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
  if (!API_BASE) {
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
  if (!API_BASE) {
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
  if (!API_BASE) {
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
