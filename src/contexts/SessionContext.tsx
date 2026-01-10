"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export interface Session {
  id: string;
  activityType: string;
  players: string[];
  startedAt: Date;
  status: "active" | "completed";
}

export interface SessionScore {
  golfStrokes?: number;
  racingPosition?: number;
  padelSets?: { my: number; opp: number }[];
  myScore?: number;
  opponentScore?: number;
}

interface SessionContextValue {
  // Session state
  session: Session | null;
  isLoading: boolean;
  isFetchingSession: boolean;
  isEnding: boolean;
  error: string | null;
  elapsedTime: number;
  elapsedTimeFormatted: string;

  // Score state (persisted across navigation)
  score: SessionScore;
  updateScore: (updates: Partial<SessionScore>) => void;

  // Panel state
  isPanelExpanded: boolean;
  setPanelExpanded: (expanded: boolean) => void;
  isPanelMinimized: boolean;
  setPanelMinimized: (minimized: boolean) => void;

  // Actions
  startSession: (
    activityType: string,
    players: string[]
  ) => Promise<Session | null>;
  endSession: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}

// Safe hook that returns null if no provider (for optional usage)
export function useSessionContextSafe() {
  return useContext(SessionContext);
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSession, setIsFetchingSession] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Score state
  const [score, setScore] = useState<SessionScore>({
    golfStrokes: 72,
    racingPosition: 1,
    padelSets: [{ my: 0, opp: 0 }],
    myScore: 0,
    opponentScore: 0,
  });

  // Panel state
  const [isPanelExpanded, setPanelExpanded] = useState(false);
  const [isPanelMinimized, setPanelMinimized] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef(false);

  // Fetch active session on mount
  const fetchActiveSession = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/api/sessions", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        // No active session or not authenticated
        return;
      }

      const data = await response.json();

      // Check if there's an active session
      // API might return array of sessions or single session
      let activeSession = null;

      if (Array.isArray(data)) {
        activeSession = data.find((s: Session) => s.status === "active");
      } else if (data.id || data.sessionId) {
        // Single session object with an id
        activeSession = data.status === "active" ? data : null;
      } else if (typeof data === "object" && Object.keys(data).length === 0) {
        // Empty object - treat as active session for testing
        // TODO: Remove this when API returns proper session data
        activeSession = {
          id: "test-session",
          activityType: "padel",
          players: [],
          startedAt: new Date().toISOString(),
          status: "active",
        };
      }

      if (activeSession) {
        setSession({
          id: activeSession.id || activeSession.sessionId,
          activityType: activeSession.activityType,
          players: activeSession.players || [],
          startedAt: new Date(
            activeSession.startedAt || activeSession.createdAt
          ),
          status: "active",
        });

        // Restore score if available
        if (activeSession.score) {
          setScore((prev) => ({
            ...prev,
            ...activeSession.score,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch active session:", err);
    } finally {
      setIsFetchingSession(false);
    }
  }, []);

  // Fetch session on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchActiveSession();
  }, [fetchActiveSession]);

  // Timer for active session
  useEffect(() => {
    if (!session || session.status !== "active") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startTime = new Date(session.startedAt).getTime();
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000));

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session]);

  const formatElapsedTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const updateScore = useCallback((updates: Partial<SessionScore>) => {
    setScore((prev) => ({ ...prev, ...updates }));
  }, []);

  const startSession = useCallback(
    async (
      activityType: string,
      players: string[]
    ): Promise<Session | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:3000/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            activityType,
            players,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create session");
        }

        const data = await response.json();

        const newSession: Session = {
          id: data.sessionId,
          activityType,
          players,
          startedAt: new Date(),
          status: "active",
        };

        // Reset score for new session
        setScore({
          golfStrokes: 72,
          racingPosition: 1,
          padelSets: [{ my: 0, opp: 0 }],
          myScore: 0,
          opponentScore: 0,
        });

        setSession(newSession);
        setElapsedTime(0);
        setPanelMinimized(false);

        return newSession;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start session";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const endSession = useCallback(async (): Promise<boolean> => {
    if (!session) {
      setError("No active session");
      return false;
    }

    setIsEnding(true);
    setError(null);

    // Build score data based on activity type
    let scoreData: Record<string, unknown> = {};
    switch (session.activityType) {
      case "golf":
        scoreData = { strokes: score.golfStrokes };
        break;
      case "racing":
        scoreData = { position: score.racingPosition };
        break;
      case "padel":
        scoreData = { sets: score.padelSets };
        break;
      default:
        scoreData = {
          myScore: score.myScore,
          opponentScore: score.opponentScore,
        };
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${session.id}/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ score: scoreData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to end session");
      }

      setSession(null);
      setPanelExpanded(false);
      setPanelMinimized(false);

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to end session";
      setError(errorMessage);
      return false;
    } finally {
      setIsEnding(false);
    }
  }, [session, score]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SessionContextValue = {
    session,
    isLoading,
    isFetchingSession,
    isEnding,
    error,
    elapsedTime,
    elapsedTimeFormatted: formatElapsedTime(elapsedTime),
    score,
    updateScore,
    isPanelExpanded,
    setPanelExpanded,
    isPanelMinimized,
    setPanelMinimized,
    startSession,
    endSession,
    refreshSession: fetchActiveSession,
    clearError,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
