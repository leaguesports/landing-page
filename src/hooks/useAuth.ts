"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuthState,
  getGoogleSignInUrl,
  logout as apiLogout,
  type AuthState,
} from "@/lib/api-client";
import {
  consumeAuthReturnTo,
  stashAuthReturnTo,
} from "@/lib/auth-return-to";
import { usePathname } from "next/navigation";

const INITIAL_AUTH: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

export function useAuth() {
  const pathname = usePathname();
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

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    consumeAuthReturnTo(pathname || "/");
  }, [auth.isAuthenticated, isLoading, pathname]);

  const signIn = useCallback((returnTo?: string) => {
    stashAuthReturnTo(returnTo);
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
    auth.user?.displayName ??
    auth.user?.name ??
    (auth.user?.handle ? `@${auth.user.handle}` : undefined) ??
    auth.user?.email ??
    "";

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    displayName,
    handle: auth.user?.handle ?? "",
    authError: auth.error,
    isLoading,
    signIn,
    signOut,
    refresh,
  };
}
