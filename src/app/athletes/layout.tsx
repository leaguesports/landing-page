import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athlete tools",
  description:
    "Start padel and golf scorecards, then sign in for locked history, badges, communities, training, and Import session on LeagueSports.",
  alternates: {
    canonical: "/athletes",
  },
  openGraph: {
    title: "Athlete tools | LeagueSports",
    description:
      "Live padel and golf scorecards, plus the signed-in hub for progress, badges, communities, training, and integrations.",
  },
};

export default function AthletesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
