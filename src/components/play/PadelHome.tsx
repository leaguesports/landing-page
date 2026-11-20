"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  isPadelCaptureAction,
  padelCaptureHref,
  padelHomeHref,
} from "@/lib/play/padel-capture";
import {
  PadelHomeView,
  beginPadelSession,
  padelEyebrow,
  padelTitle,
  reducePadelNotice,
  type PadelHomeAction,
} from "@/lib/play/padel-home";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PadelCapture } from "./PadelCapture";

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

function readCaptureFromLocation(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return isPadelCaptureAction(params.get("action"));
}

function writeCaptureInUrl(open: boolean) {
  if (typeof window === "undefined") return;
  const href = open ? padelCaptureHref() : padelHomeHref();
  if (`${window.location.pathname}${window.location.search}` !== href) {
    window.history.replaceState(null, "", href);
  }
}

export function PadelHome({
  initialActionParam = null,
}: {
  initialActionParam?: string | null;
}) {
  const { isAuthenticated, isLoading, displayName } = useAuth();
  const date = useLocalDate();
  const [notice, setNotice] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(() =>
    isPadelCaptureAction(initialActionParam),
  );

  useEffect(() => {
    if (isPadelCaptureAction(initialActionParam) || readCaptureFromLocation()) {
      setCapturing(true);
    }
  }, [initialActionParam]);

  function openCapture() {
    setNotice(null);
    setCapturing(true);
    writeCaptureInUrl(true);
  }

  function closeCapture() {
    setCapturing(false);
    writeCaptureInUrl(false);
  }

  function onAction(action: PadelHomeAction) {
    const started = beginPadelSession(action);
    if (started === "record") {
      openCapture();
      return;
    }
    setNotice((current) => reducePadelNotice(current, action));
  }

  if (capturing) {
    return <PadelCapture onCancel={closeCapture} onSaved={closeCapture} />;
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
