import { PlayDashboardPage, playDashboardMetadata } from "../_dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = playDashboardMetadata("golf");

export default function PlayGolfPage() {
  return <PlayDashboardPage slug="golf" />;
}
