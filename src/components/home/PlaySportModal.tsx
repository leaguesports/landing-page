"use client";

import {
  hubPlayModalDescription,
  hubPlayModalTitle,
  type HubPlaySportOption,
  type HubPlayVerbId,
} from "@/lib/sports/hub-ia";
import { ArrowUpRight, Flag, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";

type PlaySportModalProps = {
  verb: HubPlayVerbId;
  options: HubPlaySportOption[];
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PlaySportModal({ verb, options, onClose }: PlaySportModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = [
        ...root.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => !node.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss sport picker"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#141814] shadow-[0_18px_40px_rgba(0,0,0,0.45)] outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-3">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-xl tracking-wide text-white"
            >
              {hubPlayModalTitle(verb)}
            </h2>
            <p
              id={descriptionId}
              className="mt-0.5 text-sm leading-relaxed text-zinc-500"
            >
              {hubPlayModalDescription(verb)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {options.length > 0 ? (
          <ul className="p-2">
            {options.map((option) => (
              <li key={option.slug}>
                <Link
                  href={option.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-emerald-200">
                    {option.slug === "golf" ? (
                      <Flag className="h-4 w-4" aria-hidden />
                    ) : (
                      <Trophy className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">
                      {option.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                      {option.description}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-zinc-600"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm leading-relaxed text-zinc-400">
            No playable sports yet.
          </p>
        )}

        <div className="border-t border-white/8 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
