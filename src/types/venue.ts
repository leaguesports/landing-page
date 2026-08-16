// id        String   @id @default(uuid())
// slug      String   @unique
// name      String
// address   String
// city      String
// province  String
// postcode  String
// country   String
// phone     String
// email     String
// website   String
// latitude  Float
// longitude Float

export type Venue = {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  /** Load-shedding resilience for SA venues */
  has_generator_backup?: boolean;
  has_big_screens?: boolean;
  has_live_audio?: boolean;
  has_craft_drafts?: boolean;
  has_food_menu?: boolean;
  has_outdoor_area?: boolean;
  has_parking?: boolean;
  is_verified?: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
};
