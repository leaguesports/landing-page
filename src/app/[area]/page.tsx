import { notFound } from "next/navigation";
import {
  getSuburbNameBySlug,
  isValidCitySlug,
} from "@/data/suburbs";
import { HomeContent } from "../page";

type Props = { params: Promise<{ area: string }> };

export default async function CityPage({ params }: Props) {
  const { area: slug } = await params;


  if (!isValidCitySlug(slug)) {
    notFound();
  }
  const name = getSuburbNameBySlug(slug);


  console.log(name);
  if (!name) {
    // notFound();
  }
  return <HomeContent city={name} />;
}
