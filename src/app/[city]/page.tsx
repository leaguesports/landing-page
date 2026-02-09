import { notFound } from "next/navigation";
import {
  getSuburbNameBySlug,
  isValidCitySlug,
} from "@/data/suburbs";
import { HomeContent } from "../page";

type Props = { params: Promise<{ city: string }> };

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  if (!isValidCitySlug(slug)) {
    notFound();
  }
  const name = getSuburbNameBySlug(slug);
  if (!name) {
    notFound();
  }
  return <HomeContent city={name} />;
}
