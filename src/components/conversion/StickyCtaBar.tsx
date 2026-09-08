"use client";

import { ConversionCtaLink, type CtaPairTone } from "@/components/conversion/CtaPair";
import type { CtaMatrix } from "@/lib/conversion/cta-matrix";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_PREFIX = "ls.conversion.sticky.dismissed:";

function storageKey(pageKey: string): string {
  return `${STORAGE_PREFIX}${pageKey}`;
}

export function StickyCtaBar({
  matrix,
  tone = "play",
  sport,
  city,
  slug,
  pageKey,
  offsetClassName = "",
}: {
  matrix: CtaMatrix;
  tone?: CtaPairTone;
  sport?: string | null;
  city?: string | null;
  slug?: string | null;
  pageKey: string;
  /** Extra bottom offset when another bar (venue claim) is already docked. */
  offsetClassName?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(storageKey(pageKey)) === "1");
    } catch {
      setDismissed(false);
    }
  }, [pageKey]);

  useEffect(() => {
    if (dismissed) return;

    function onScroll() {
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setVisible(false);
        return;
      }
      setVisible(window.scrollY / max >= 0.4);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    setVisible(false);
    try {
      sessionStorage.setItem(storageKey(pageKey), "1");
    } catch {
      // Private mode — dismiss for this paint only.
    }
  }

  if (dismissed || !visible) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-40 p-3 sm:p-4 ${offsetClassName || "bottom-0"}`.trim()}
    >
      <div
        role="region"
        aria-label="Page actions"
        className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-white/12 bg-[#141814]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-3 sm:px-4"
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <ConversionCtaLink
            cta={matrix.primary}
            matrix={matrix}
            slot="sticky"
            tone={tone}
            variant="primary"
            sport={sport}
            city={city}
            slug={slug}
            className={
              tone === "watch"
                ? "inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-950 hover:bg-sky-400 hover:text-white sm:flex-none sm:px-5"
                : "inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 sm:flex-none sm:px-5"
            }
          />
          <ConversionCtaLink
            cta={matrix.secondary}
            matrix={matrix}
            slot="sticky"
            tone={tone}
            variant="secondary"
            sport={sport}
            city={city}
            slug={slug}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white hover:bg-white hover:text-zinc-950 sm:flex-none sm:px-5"
          />
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss actions"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
