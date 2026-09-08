"use client";

import { track } from "@/lib/analytics/track";
import type { PageType } from "@/lib/analytics/track";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

function whatsAppHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

export function PostActionShare({
  url,
  text,
  pageType,
  sport,
  heading = "Share this",
  compact = false,
}: {
  url: string;
  text?: string | null;
  pageType: PageType;
  sport?: string | null;
  heading?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState(url);

  useEffect(() => {
    setAbsoluteUrl(toAbsoluteUrl(url));
  }, [url]);

  const shareText = text?.trim()
    ? text.replace(/\{url\}/g, absoluteUrl)
    : absoluteUrl;
  const href = whatsAppHref(shareText);

  function fireShare(channel: "whatsapp" | "copy") {
    track("share_click", {
      page_type: pageType,
      cta_slot: "inline",
      sport: sport ?? undefined,
      channel,
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      fireShare("copy");
    } catch {
      setCopied(false);
    }
  }

  const actions = (
    <div className="flex flex-wrap gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => fireShare("whatsapp")}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-black hover:bg-[#1ebe57]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 text-sm font-medium text-white hover:bg-white hover:text-zinc-950"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-300" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );

  if (compact) {
    return (
      <div aria-label="Share" className="flex flex-wrap items-center gap-2">
        {actions}
      </div>
    );
  }

  return (
    <section
      aria-label="Share"
      className="rounded-3xl border border-white/8 bg-[#141814] px-5 py-5 sm:px-6"
    >
      <p className="text-sm font-semibold text-white">{heading}</p>
      <p className="mt-1 truncate text-xs text-zinc-500">{absoluteUrl}</p>
      <div className="mt-4">{actions}</div>
    </section>
  );
}
