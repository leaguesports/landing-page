"use client";

import {
  getAuthState,
  getGoogleSignInUrl,
  logout as apiLogout,
  type AuthState,
  type AuthUser,
} from "@/lib/api-client";
import {
  consumeAuthReturnTo,
  stashAuthReturnTo,
} from "@/lib/auth-return-to";
import {
  emptyFriendsSnapshot,
  listFriendsResult,
  type FriendsSnapshot,
} from "@/lib/friends/friends";
import {
  FRIENDS_CHANGED_EVENT,
  readFriendsChangedSnapshot,
} from "@/lib/notifications/notifications";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const INITIAL_AUTH: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  displayName: string;
  handle: string;
  authError: string | null;
  isLoading: boolean;
  signIn: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

export type FriendsSessionValue = {
  snapshot: FriendsSnapshot | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  /** Seed from an RSC-fetched snapshot (home hub). Skips the client GET. */
  seedSnapshot: (snapshot: FriendsSnapshot) => void;
  /** Replace the shared snapshot after a local mutation. */
  applySnapshot: (snapshot: FriendsSnapshot) => void;
  /**
   * Load friends once when no RSC seed is present. Safe to call repeatedly.
   * NotificationCenter calls this when the inbox opens so non-hub routes do
   * not eagerly GET /api/me/friends on every page view.
   */
  ensureLoaded: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const FriendsContext = createContext<FriendsSessionValue | null>(null);

function useProvideAuth(): AuthContextValue {
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
    let cancelled = false;
    void (async () => {
      // Yield so the initial auth load is not a synchronous setState-in-effect.
      await Promise.resolve();
      if (cancelled) return;
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    // Refresh when the tab becomes visible again (e.g. after OAuth).
    // Do not listen to window "focus" — clicking the page after DevTools
    // (or any focus steal) would spam GET /api/auth/me.
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void refresh();
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

function useProvideFriends(
  isAuthenticated: boolean,
  authLoading: boolean,
): FriendsSessionValue {
  const [snapshot, setSnapshot] = useState<FriendsSnapshot | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const seededRef = useRef(false);
  const loadInFlightRef = useRef(false);

  const seedSnapshot = useCallback((next: FriendsSnapshot) => {
    seededRef.current = true;
    loadInFlightRef.current = false;
    setSnapshot(next);
    setStatus("ready");
    setError(null);
  }, []);

  const applySnapshot = useCallback((next: FriendsSnapshot) => {
    setSnapshot(next);
    setStatus("ready");
    setError(null);
  }, []);

  const ensureLoaded = useCallback(() => {
    if (authLoading || !isAuthenticated) return;
    if (seededRef.current || snapshot !== null) return;
    if (loadInFlightRef.current || status === "loading") return;

    loadInFlightRef.current = true;
    setStatus("loading");
    setError(null);

    void listFriendsResult().then((result) => {
      loadInFlightRef.current = false;
      if (seededRef.current) return;
      if (result.ok) {
        setSnapshot(result.snapshot);
        setStatus("ready");
        setError(null);
        return;
      }
      // Leave snapshot null — do not treat failure as an empty graph.
      setStatus("error");
      setError(result.error);
    });
  }, [authLoading, isAuthenticated, snapshot, status]);

  useEffect(() => {
    let cancelled = false;

    // While auth is unresolved, keep any RSC seed — do not clear.
    if (authLoading) {
      return () => {
        cancelled = true;
      };
    }

    if (!isAuthenticated) {
      seededRef.current = false;
      loadInFlightRef.current = false;
      void (async () => {
        await Promise.resolve();
        if (cancelled) return;
        setSnapshot(null);
        setStatus("idle");
        setError(null);
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    function onFriendsChanged(event: Event) {
      const next = readFriendsChangedSnapshot(event);
      if (next) applySnapshot(next);
    }
    window.addEventListener(FRIENDS_CHANGED_EVENT, onFriendsChanged);
    return () => {
      window.removeEventListener(FRIENDS_CHANGED_EVENT, onFriendsChanged);
    };
  }, [applySnapshot]);

  return {
    snapshot,
    status,
    error,
    seedSnapshot,
    applySnapshot,
    ensureLoaded,
  };
}

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const auth = useProvideAuth();
  const friends = useProvideFriends(auth.isAuthenticated, auth.isLoading);

  const authValue = useMemo(() => auth, [auth]);
  const friendsValue = useMemo(() => friends, [friends]);

  return (
    <AuthContext.Provider value={authValue}>
      <FriendsContext.Provider value={friendsValue}>
        {children}
      </FriendsContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AppSessionProvider");
  }
  return value;
}

export function useFriendsSession(): FriendsSessionValue {
  const value = useContext(FriendsContext);
  if (!value) {
    throw new Error("useFriendsSession must be used within AppSessionProvider");
  }
  return value;
}

/** Apply an RSC friends snapshot before the provider's client fetch effect. */
export function FriendsSnapshotSeed({
  snapshot,
}: {
  snapshot: FriendsSnapshot;
}) {
  const { seedSnapshot } = useFriendsSession();

  useLayoutEffect(() => {
    seedSnapshot(snapshot);
  }, [seedSnapshot, snapshot]);

  return null;
}

export function friendsSnapshotOrEmpty(
  snapshot: FriendsSnapshot | null,
): FriendsSnapshot {
  return snapshot ?? emptyFriendsSnapshot();
}
