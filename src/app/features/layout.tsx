import MarketingLayout from "@/components/MarketingLayout";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
