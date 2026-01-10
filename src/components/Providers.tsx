"use client";

import { SessionProvider } from "@/contexts/SessionContext";
import ActiveSessionPanel from "./ActiveSessionPanel";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <ActiveSessionPanel />
    </SessionProvider>
  );
}
