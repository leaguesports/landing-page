"use client";

import { golfTourOutlineButtonClass } from "@/components/golf-tours/GolfTourPlayerSlots";
import { absoluteAppUrl } from "@/lib/golf-tours/golf-tours";
import { Check, Share2 } from "lucide-react";
import { useState } from "react";

type GolfTourShareButtonProps = {
  path: string;
  title?: string;
  label?: string;
};

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      return true;
    } catch {
      return false;
    }
  }
}

export async function shareGolfTourPath(
  path: string,
  title?: string,
): Promise<"shared" | "copied" | "failed"> {
  const origin =
    typeof window === "undefined" ? "" : window.location.origin;
  const url = absoluteAppUrl(path, origin);
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ url, title: title?.trim() || "Golf tour" });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "failed";
      }
    }
  }
  const copied = await copyText(url);
  return copied ? "copied" : "failed";
}

export function GolfTourShareButton({
  path,
  title,
  label = "Share",
}: GolfTourShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const result = await shareGolfTourPath(path, title);
    if (result === "copied") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className={golfTourOutlineButtonClass("gap-2 px-4")}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-300" aria-hidden />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
