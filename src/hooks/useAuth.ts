"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

interface AuthActions {
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}

const AuthContext = createContext<AuthState & AuthActions>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: async () => {},
  refreshAuth: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthCheck() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const hasChecked = useRef(false);

  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    // Clear auth state regardless of API response
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  }, []);

  const refreshAuth = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 204 || response.status === 200) {
        let user: User | null = null;

        if (response.status === 200) {
          try {
            user = await response.json();
          } catch {
            user = { id: "user" };
          }
        } else {
          user = { id: "user" };
        }

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function checkAuth() {
      try {
        const response = await fetch("http://localhost:3000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 204 || response.status === 200) {
          let user: User | null = null;

          if (response.status === 200) {
            try {
              user = await response.json();
            } catch {
              user = { id: "user" };
            }
          } else {
            user = { id: "user" };
          }

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    }

    checkAuth();
  }, []);

  return {
    ...authState,
    logout,
    refreshAuth,
  };
}

export { AuthContext };
