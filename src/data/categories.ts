export type SportCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export const BALL_SPORTS: SportCategory = {
  id: "ball-sports",
  slug: "ball-sports",
  name: "Ball Sports",
  description: "Ball Sports are sports that are played with a ball.",
};

export const RACQUET_AND_BAT_SPORTS: SportCategory = {
  id: "racquet-and-bat-sports",
  slug: "racquet-and-bat-sports",
  name: "Racquet and Bat Sports",
  description:
    "Racquet and Bat Sports are sports that are played with a racquet or a bat.",
};

export const MOTOR_SPORTS: SportCategory = {
  id: "motor-sports",
  slug: "motor-sports",
  name: "Motor Sports",
  description: "Motor Sports are sports that are played with a motor.",
};

export const PRECISION_SPORTS: SportCategory = {
  id: "precision-sports",
  slug: "precision-sports",
  name: "Precision Sports",
  description: "Precision Sports are sports that are played with a precision.",
};

export const COMBAT_SPORTS: SportCategory = {
  id: "combat-sports",
  slug: "combat-sports",
  name: "Combat Sports",
  description: "Combat Sports are sports that are played with a combat.",
};

export const WATER_SPORTS: SportCategory = {
  id: "water-sports",
  slug: "water-sports",
  name: "Water Sports",
  description: "Water Sports are sports that are played in the water.",
};

export const SPORTS_CATEGORIES = {
  BALL_SPORTS,
  RACQUET_AND_BAT_SPORTS,
  MOTOR_SPORTS,
  PRECISION_SPORTS,
  COMBAT_SPORTS,
  WATER_SPORTS,
};

export const SPORTS_CATEGORIES_LIST: SportCategory[] =
  Object.values(SPORTS_CATEGORIES);
