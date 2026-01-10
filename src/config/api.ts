/**
 * API Configuration
 *
 * The API base URL can be configured via the NEXT_PUBLIC_API_URL environment variable.
 * If not set, it defaults to http://localhost:3000
 *
 * Usage:
 *   - In development: Set NEXT_PUBLIC_API_URL in .env.local
 *   - In production: Set NEXT_PUBLIC_API_URL in your deployment environment
 *
 * Example .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:3000
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper function to construct API endpoints
export function apiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_ME: apiUrl("/api/auth/me"),
  AUTH_LOGIN: apiUrl("/api/auth/login"),
  AUTH_LOGOUT: apiUrl("/api/auth/logout"),
  AUTH_GOOGLE_SIGNIN: apiUrl("/api/auth/providers/google/signin"),

  // Sessions
  SESSIONS: apiUrl("/api/sessions"),
  SESSION_END: (sessionId: string) => apiUrl(`/api/sessions/${sessionId}/end`),

  // Matches
  MATCHES: apiUrl("/api/matches"),

  // Communities
  COMMUNITIES: apiUrl("/api/communities"),
  COMMUNITY: (id: string) => apiUrl(`/api/communities/${id}`),
} as const;
