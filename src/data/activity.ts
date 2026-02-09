export type Activity = {
  id: string;
  slug: string;
  name: string;
};

export const FORMULA_1: Activity = {
  id: "f1",
  slug: "f1",
  name: "Formula 1",
};

export const MOTOGP: Activity = {
  id: "motogp",
  slug: "motogp",
  name: "MotoGP",
};

export const CRICKET: Activity = {
  id: "cricket",
  slug: "cricket",
  name: "Cricket",
};

export const RUGBY: Activity = {
  id: "rugby",
  slug: "rugby",
  name: "Rugby",
};

export const SOCCER: Activity = {
  id: "soccer",
  slug: "soccer",
  name: "Soccer",
};

export const GOLF: Activity = {
  id: "golf",
  slug: "golf",
  name: "Golf",
};

export const PADEL: Activity = {
  id: "padel",
  slug: "padel",
  name: "Padel",
};

export const ACTIVITIES = {
  FORMULA_1,
  MOTOGP,
  CRICKET,
  RUGBY,
  SOCCER,
  GOLF,
  PADEL,
};

export const ACTIVITY_LIST = Object.values(ACTIVITIES);
