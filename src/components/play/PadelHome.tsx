"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  PadelHomeView,
  padelEyebrow,
  padelTitle,
  reducePadelNotice,
  type PadelHomeAction,
} from "@/lib/play/padel-home";
import { useState, useSyncExternalStore } from "react";

function subscribeToDate(): () => void {
  return () => {};
}

let clientDate: Date | null = null;

function readLocalDate(): Date {
  clientDate ??= new Date();
  return clientDate;
}

function readServerDate(): null {
  return null;
}

/** Local calendar date after hydration, so the eyebrow matches the phone. */
function useLocalDate(): Date | null {
  return useSyncExternalStore(subscribeToDate, readLocalDate, readServerDate);
}

export function PadelHome() {
  const { isAuthenticated, isLoading, displayName } = useAuth();
  const date = useLocalDate();
  const [notice, setNotice] = useState<string | null>(null);

  function onAction(action: PadelHomeAction) {
    setNotice((current) => reducePadelNotice(current, action));
  }

  return (
    <PadelHomeView
      eyebrow={padelEyebrow(date)}
      title={padelTitle({
        signedIn: !isLoading && isAuthenticated,
        displayName,
      })}
      notice={notice}
      onAction={onAction}
    />
  );
}
