"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuthState,
  getGoogleSignInUrl,
  logout as apiLogout,
  type AuthState,
} from "@/lib/api-client";

const INITIAL_AUTH: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(INITIAL_AUTH);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await getAuthState();
      setAuth(state);
    } catch {
      setAuth({
        isAuthenticated: false,
        user: null,
        error: "Could not verify sign-in status",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Refresh when the tab becomes visible again (e.g. after OAuth).
    // Do not listen to window "focus" — clicking the page after DevTools
    // (or any focus steal) would spam GET /api/auth/me and look like
    // Start Match is hitting auth.
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  const signIn = useCallback((returnTo?: string) => {
    const url = getGoogleSignInUrl(returnTo);
    if (url) {
      window.location.href = url;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Cookie may already be cleared
    }
    setAuth(INITIAL_AUTH);
  }, []);

  const displayName =
    auth.user?.displayName ?? auth.user?.name ?? auth.user?.email ?? "";

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    displayName,
    authError: auth.error,
    isLoading,
    signIn,
    signOut,
    refresh,
  };
}
