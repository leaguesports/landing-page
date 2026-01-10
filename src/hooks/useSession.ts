"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Session {
  id: string;
  activityType: string;
  players: string[];
  startedAt: Date;
  status: "active" | "completed";
}

interface UseSessionOptions {
  onSessionStart?: (session: Session) => void;
  onSessionEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  isEnding: boolean;
  error: string | null;
  elapsedTime: number;
  elapsedTimeFormatted: string;
  startSession: (
    activityType: string,
    players: string[]
  ) => Promise<Session | null>;
  endSession: (score: Record<string, unknown>) => Promise<boolean>;
  clearError: () => void;
}

export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for active session
  useEffect(() => {
    if (!session || session.status !== "active") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Calculate initial elapsed time
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

        setSession(newSession);
        setElapsedTime(0);
        options.onSessionStart?.(newSession);

        return newSession;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start session";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const endSession = useCallback(
    async (score: Record<string, unknown>): Promise<boolean> => {
      if (!session) {
        setError("No active session");
        return false;
      }

      setIsEnding(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/sessions/${session.id}/end`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ score }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to end session");
        }

        setSession((prev) => (prev ? { ...prev, status: "completed" } : null));
        options.onSessionEnd?.();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to end session";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return false;
      } finally {
        setIsEnding(false);
      }
    },
    [session, options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    session,
    isLoading,
    isEnding,
    error,
    elapsedTime,
    elapsedTimeFormatted: formatElapsedTime(elapsedTime),
    startSession,
    endSession,
    clearError,
  };
}

// Helper hook for logging completed matches (non-live)
interface UseLogMatchReturn {
  isLogging: boolean;
  error: string | null;
  logMatch: (
    activityType: string,
    players: string[],
    score: Record<string, unknown>
  ) => Promise<boolean>;
  clearError: () => void;
}

export function useLogMatch(): UseLogMatchReturn {
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logMatch = useCallback(
    async (
      activityType: string,
      players: string[],
      score: Record<string, unknown>
    ): Promise<boolean> => {
      setIsLogging(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:3000/api/matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            activityType,
            players,
            score,
            playedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to log match");
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to log match";
        setError(errorMessage);
        return false;
      } finally {
        setIsLogging(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLogging,
    error,
    logMatch,
    clearError,
  };
}
