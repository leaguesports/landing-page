"use server";

type Sport = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export async function getSports(): Promise<Sport[]> {
  const response = await fetch("http://localhost:3000/api/sports");
  const data = await response.json();
  return data;
}

export async function getTopCategories(): Promise<Category[]> {
  const response = await fetch(
    "http://localhost:3000/api/sports/categories?limit=4",
  );
  const data = await response.json();
  return data;
}
