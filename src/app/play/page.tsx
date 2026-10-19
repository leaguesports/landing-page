import { PlayModeApp } from "@/components/play/PlayModeApp";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Play",
  description: "Switch between Social, Golf, and Padel.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[]; feed?: string | string[] }>;
}) {
  const params = await searchParams;
  return (
    <PlayModeApp
      initialModeParam={firstParam(params.mode)}
      initialFeedParam={firstParam(params.feed)}
    />
  );
}
