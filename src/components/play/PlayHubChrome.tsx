import { HubBottomNav } from "@/components/hub/HubBottomNav";
import { getServerAuthState } from "@/lib/server-auth";
import type { ReactNode } from "react";

type PlayHubChromeProps = {
  children: ReactNode;
};

export async function PlayHubChrome({ children }: PlayHubChromeProps) {
  const auth = await getServerAuthState();
  const signedIn = Boolean(auth.isAuthenticated && auth.user?.id);

  return (
    <div
      className={
        signedIn
          ? "min-h-dvh bg-[#0c0f0c] pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-white lg:pb-[calc(6.25rem+env(safe-area-inset-bottom))]"
          : "min-h-dvh bg-[#0c0f0c] text-white"
      }
    >
      {children}
      {signedIn ? <HubBottomNav active="play" /> : null}
    </div>
  );
}
