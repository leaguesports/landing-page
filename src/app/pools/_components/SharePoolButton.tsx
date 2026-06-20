"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { getShareUrl, getWhatsAppShareUrl } from "@/lib/pool-utils";

export default function SharePoolButton({
  inviteCode,
  poolName,
}: {
  inviteCode: string;
  poolName: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(inviteCode);
  const whatsAppUrl = getWhatsAppShareUrl(inviteCode, poolName);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
        Invite friends
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2">
          <span className="text-2xl font-black tracking-[0.3em] text-green-400">
            {inviteCode}
          </span>
        </div>
        <p className="min-w-0 flex-1 break-all text-sm text-zinc-400">
          {shareUrl}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-600/20 px-4 py-2.5 text-sm font-medium text-green-300 transition-colors hover:bg-green-600/30"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
