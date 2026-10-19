"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  GolfHomeView,
  golfGreeting,
  reduceGolfNotice,
  type GolfHomeAction,
} from "@/lib/play/golf-home";
import { useState, useSyncExternalStore } from "react";

function subscribeToHour(): () => void {
  return () => {};
}

function readLocalHour(): number {
  return new Date().getHours();
}

function readServerHour(): null {
  return null;
}

/** Local hour after hydration, so the greeting matches the phone clock. */
function useLocalHour(): number | null {
  return useSyncExternalStore(subscribeToHour, readLocalHour, readServerHour);
}

export function GolfHome() {
  const { isAuthenticated, isLoading, displayName } = useAuth();
  const hour = useLocalHour();
  const [notice, setNotice] = useState<string | null>(null);

  function onAction(action: GolfHomeAction) {
    setNotice((current) => reduceGolfNotice(current, action));
  }

  return (
    <GolfHomeView
      greeting={golfGreeting({
        signedIn: !isLoading && isAuthenticated,
        displayName,
        hour,
      })}
      notice={notice}
      onAction={onAction}
    />
  );
}
