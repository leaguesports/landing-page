import { PlayDashboardPage, playDashboardMetadata } from "../_dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = playDashboardMetadata("darts");

export default function PlayDartsPage() {
  return <PlayDashboardPage slug="darts" />;
}
