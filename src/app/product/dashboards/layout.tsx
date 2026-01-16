import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sport Dashboards - Custom Tools for Every Sport",
  description:
    "Purpose-built dashboards for darts, padel, sim racing, pool, and more. Each sport gets its own custom scoring system, metrics, and analytics tailored to how you actually play.",
  keywords: [
    "darts scoring app",
    "padel statistics",
    "sim racing dashboard",
    "pool score tracker",
    "sport-specific analytics",
    "custom sports dashboard",
  ],
  openGraph: {
    title: "Sport Dashboards | LeagueSports",
    description:
      "Every sport has unique metrics. Our dashboards are purpose-built for each one.",
  },
};

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
