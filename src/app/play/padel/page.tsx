import { PlayDashboardPage, playDashboardMetadata } from "../_dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = playDashboardMetadata("padel");

export default function PlayPadelPage() {
  return <PlayDashboardPage slug="padel" />;
}
