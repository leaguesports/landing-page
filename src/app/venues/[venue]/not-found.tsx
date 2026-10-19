import { DeepLinkRecovery } from "@/components/conversion/DeepLinkRecovery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venue",
  robots: { index: false, follow: false },
};

export default function VenueNotFound() {
  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <DeepLinkRecovery kind="venue" />
    </div>
  );
}
