"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuthState,
  getGoogleSignInUrl,
  logout as apiLogout,
  type AuthState,
} from "@/lib/api-client";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await getAuthState();
      setAuth(state);
    } catch {
      setAuth({ isAuthenticated: false, user: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
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
    setAuth({ isAuthenticated: false, user: null });
  }, []);

  const displayName =
    auth.user?.displayName ?? auth.user?.name ?? auth.user?.email ?? "";

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    displayName,
    isLoading,
    signIn,
    signOut,
    refresh,
  };
}
