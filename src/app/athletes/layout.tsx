import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athlete tools",
  description:
    "Sign in for your profile, friends, and communities on LeagueSports.",
  alternates: {
    canonical: "/athletes",
  },
  openGraph: {
    title: "Athlete tools | LeagueSports",
    description:
      "Your profile, friends, and communities on LeagueSports.",
  },
};

export default function AthletesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
