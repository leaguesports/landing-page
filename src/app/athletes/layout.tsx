import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athlete tools",
  description:
    "Track padel and golf with live scorecards, locked match history, badges, and progress on LeagueSports.",
  alternates: {
    canonical: "/athletes",
  },
  openGraph: {
    title: "Athlete tools | LeagueSports",
    description:
      "Live scorecards, locked history, and progress tools for athletes on LeagueSports.",
  },
};

export default function AthletesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
