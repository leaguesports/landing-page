"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getSuburbNameBySlug,
  isValidCitySlug,
} from "@/data/suburbs";

type SuburbContextValue = {
  /** Display name of the selected city (e.g. "Sandton") or null when on / */
  suburb: string | null;
  /** Navigate to / (slug null) or /[slug] (slug string) */
  setSuburb: (slug: string | null) => void;
  isReady: boolean;
};

const SuburbContext = createContext<SuburbContextValue | null>(null);

function suburbFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const segment = segments[0];
  if (!segment || !isValidCitySlug(segment)) return null;
  return getSuburbNameBySlug(segment);
}

export function SuburbProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const suburb = useMemo(() => suburbFromPathname(pathname), [pathname]);

  const setSuburb = useCallback(
    (slug: string | null) => {
      if (slug) {
        router.push(`/${slug}`);
      } else {
        router.push("/");
      }
    },
    [router]
  );

  const value = useMemo<SuburbContextValue>(
    () => ({ suburb, setSuburb, isReady: true }),
    [suburb, setSuburb]
  );

  return (
    <SuburbContext.Provider value={value}>{children}</SuburbContext.Provider>
  );
}

export function useSuburb() {
  const ctx = useContext(SuburbContext);
  if (!ctx) {
    throw new Error("useSuburb must be used within SuburbProvider");
  }
  return ctx;
}
