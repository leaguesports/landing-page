import type { Metadata } from "next";
import PoolPageClient from "@/app/pools/_components/PoolPageClient";

export const metadata: Metadata = {
  title: "Prediction Pool",
  description: "Join a match prediction pool on LeagueSports.",
};

export default async function JoinPoolPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-700 via-green-500 to-green-700" />
      <PoolPageClient inviteCode={inviteCode.toUpperCase()} />
    </div>
  );
}
