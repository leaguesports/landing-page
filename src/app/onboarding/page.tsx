import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { getServerAuthState } from "@/lib/server-auth";
import {
  getPreferences,
  needsOnboarding,
} from "@/lib/preferences/preferences";
import { SPORT_CATALOG } from "@/lib/sports/catalog";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const auth = await getServerAuthState();
  if (!auth.isAuthenticated || !auth.user?.id) {
    redirect("/login");
  }

  const cookie = (await cookies()).toString();
  const prefsResult = await getPreferences({ cookie });
  if (prefsResult.ok && !needsOnboarding(prefsResult.preferences)) {
    redirect("/");
  }

  const displayName =
    auth.user.displayName?.trim() ||
    auth.user.name?.trim() ||
    auth.user.handle?.trim() ||
    "";

  return (
    <div className="min-h-screen bg-[#0c0f0c] text-white">
      <OnboardingWizard displayName={displayName} sports={SPORT_CATALOG} />
    </div>
  );
}
