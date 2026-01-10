/**
 * API Configuration
 *
 * API requests are proxied through Next.js rewrites (configured in next.config.ts)
 * to avoid cross-origin cookie issues on mobile browsers.
 *
 * The actual backend URL is set via NEXT_PUBLIC_API_URL environment variable
 * and used in next.config.ts for the proxy destination.
 *
 * Example .env.local:
 *   NEXT_PUBLIC_API_URL=http://192.168.1.100:3000
 */

// Use empty string for same-origin requests (proxied through Next.js)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
