import { Activity } from "./activity";

export type Venue = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
  area: string;
  suburb: string;
  play?: Activity[];
  watch?: Activity[];
};
