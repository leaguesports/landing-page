import MarketingLayout from "@/components/MarketingLayout";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
