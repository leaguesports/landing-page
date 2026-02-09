export type Sport = {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
};

export const RUGBY: Sport = {
  id: "rugby",
  slug: "rugby",
  name: "Rugby",
  image:
    "https://images.unsplash.com/photo-1574602904329-56e2f95fb15e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Rugby is a sport that is played with a ball.",
};

export const FORMULA_1: Sport = {
  id: "f1",
  slug: "f1",
  name: "Formula 1",
  image:
    "https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Formula 1 is a sport that is played with a car.",
};

export const CRICKET: Sport = {
  id: "cricket",
  slug: "cricket",
  name: "Cricket",
  image:
    "https://images.unsplash.com/photo-1599982917650-21da4d09c437?q=80&w=1552&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Cricket is a sport that is played with a ball.",
};

export const MOTO_GP: Sport = {
  id: "moto-gp",
  slug: "moto-gp",
  name: "Moto GP",
  image:
    "https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Moto GP is a sport that is played with a motorcycle.",
};

export const SOCCER: Sport = {
  id: "soccer",
  slug: "soccer",
  name: "Soccer",
  image:
    "https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  description: "Soccer is a sport that is played with a ball.",
};

export const SPORTS: Sport[] = [RUGBY, FORMULA_1, CRICKET, MOTO_GP, SOCCER];
