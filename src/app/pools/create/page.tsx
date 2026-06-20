import type { Metadata } from "next";
import CreatePoolPageClient from "./CreatePoolPageClient";

export const metadata: Metadata = {
  title: "Create Prediction Pool",
  description:
    "Create a private match prediction pool and share it with friends on LeagueSports.",
};

export default function CreatePoolPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-green-700" />
      <CreatePoolPageClient />
    </div>
  );
}
