import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Mode - Spectator Views & Jumbotron Displays",
  description:
    "Cast live scores to big screens, enable spectator views, and create professional tournament atmospheres. Real-time sync across all devices with customizable themes.",
  keywords: [
    "live scoreboard display",
    "sports jumbotron software",
    "spectator view sports",
    "tournament display system",
    "real-time score updates",
    "multi-screen sports display",
  ],
  openGraph: {
    title: "Live Mode | LeagueSports",
    description:
      "Turn any screen into a professional sports display. Live scores, brackets, and standings.",
  },
};

export default function LiveModeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
