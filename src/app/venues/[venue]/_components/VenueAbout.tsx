"use client";

import { venueAboutExpands } from "@/lib/venues/about-copy";
import { useId, useState } from "react";

/**
 * Full About copy is in the server HTML. A long description is clamped
 * until Read more; the button only reveals text already on the page.
 */
export function VenueAbout({ paragraphs }: { paragraphs: readonly string[] }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const expands = venueAboutExpands(paragraphs);
  const clamped = expands && !open;

  return (
    <div>
      <div className="relative">
        <div
          id={bodyId}
          className={
            clamped
              ? "max-h-36 space-y-4 overflow-hidden text-base leading-relaxed text-zinc-700"
              : "space-y-4 text-base leading-relaxed text-zinc-700"
          }
        >
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {clamped ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {expands ? (
        <button
          type="button"
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
