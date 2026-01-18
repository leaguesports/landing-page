import MarketingLayout from "@/components/MarketingLayout";

export default function SportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
