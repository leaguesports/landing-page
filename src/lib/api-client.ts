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

export async function poolApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE) {
    throw new ApiError(0, "API URL is not configured");
  }

  const res = await fetch(`${API_BASE}${path}`, {
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
}

export async function getAuthState(): Promise<AuthState> {
  if (!API_BASE) {
    return { isAuthenticated: false, user: null };
  }

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include",
  });

  if (res.status === 401) {
    return { isAuthenticated: false, user: null };
  }

  if (res.status === 204) {
    return { isAuthenticated: true, user: null };
  }

  if (res.ok) {
    try {
      const user = (await res.json()) as AuthUser;
      return { isAuthenticated: true, user };
    } catch {
      return { isAuthenticated: true, user: null };
    }
  }

  return { isAuthenticated: false, user: null };
}

export function getGoogleSignInUrl(returnTo?: string): string {
  if (API_BASE) {
    const url = new URL(`${API_BASE}/api/auth/providers/google/signin`);
    if (returnTo) {
      url.searchParams.set("returnTo", returnTo);
    }
    return url.toString();
  }

  return process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? "";
}

export async function logout(): Promise<void> {
  await poolApi("/api/auth/logout", { method: "POST" });
}
