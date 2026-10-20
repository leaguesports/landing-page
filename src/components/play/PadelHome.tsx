"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  PadelHomeView,
  padelEyebrow,
  padelTitle,
  reducePadelNotice,
  type PadelHomeAction,
} from "@/lib/play/padel-home";
import {
  padelRecordDecision,
  readPadelMatches,
  readPadelMockEnabled,
  recentCardsForHome,
  savePadelMatch,
  type SavedPadelMatch,
} from "@/lib/play/mock/padel-match-store";
import { useState, useSyncExternalStore } from "react";
import { PadelRecordFlow } from "./PadelRecordFlow";

type MockSnapshot = {
  enabled: boolean;
  matches: SavedPadelMatch[];
};

const EMPTY_MOCK: MockSnapshot = { enabled: false, matches: [] };

let clientSnapshot: MockSnapshot = EMPTY_MOCK;
let clientReady = false;
const listeners = new Set<() => void>();

function readClientMock(): MockSnapshot {
  const enabled = readPadelMockEnabled({
    search: window.location.search,
    storage: window.localStorage,
  });
  return {
    enabled,
    matches: enabled ? readPadelMatches(window.localStorage) : [],
  };
}

function getClientMock(): MockSnapshot {
  if (typeof window === "undefined") return EMPTY_MOCK;
  if (!clientReady) {
    clientSnapshot = readClientMock();
    clientReady = true;
  }
  return clientSnapshot;
}

function subscribeMock(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function refreshPadelMockSnapshot(): void {
  if (typeof window === "undefined") return;
  clientSnapshot = readClientMock();
  clientReady = true;
  for (const listener of listeners) listener();
}

function usePadelMock(): MockSnapshot {
  return useSyncExternalStore(subscribeMock, getClientMock, () => EMPTY_MOCK);
}

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

function mockEnabledNow(): boolean {
  if (typeof window === "undefined") return false;
  return readPadelMockEnabled({
    search: window.location.search,
    storage: window.localStorage,
  });
}

export function PadelHome() {
  const { isAuthenticated, isLoading, displayName } = useAuth();
  const date = useLocalDate();
  const mock = usePadelMock();
  const [notice, setNotice] = useState<string | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);

  function onAction(action: PadelHomeAction) {
    if (action === "record" && padelRecordDecision(mockEnabledNow()).open) {
      setNotice(null);
      setFlowOpen(true);
      return;
    }
    setNotice((current) => reducePadelNotice(current, action));
  }

  function onSave(match: SavedPadelMatch): boolean {
    const saved = savePadelMatch(window.localStorage, match);
    if (!saved) return false;
    refreshPadelMockSnapshot();
    return true;
  }

  if (flowOpen) {
    return <PadelRecordFlow onExit={() => setFlowOpen(false)} onSave={onSave} />;
  }

  return (
    <PadelHomeView
      eyebrow={padelEyebrow(date)}
      title={padelTitle({
        signedIn: !isLoading && isAuthenticated,
        displayName,
      })}
      notice={notice}
      recent={recentCardsForHome(mock.enabled, mock.matches)}
      showDemo={mock.enabled}
      onAction={onAction}
    />
  );
}
