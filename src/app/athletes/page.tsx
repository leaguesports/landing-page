import { AthletesHubOverview } from "@/components/athletes/AthletesHubOverview";
import { AthletesMarketing } from "@/components/athletes/AthletesMarketing";
import { getServerAuthState } from "@/lib/server-auth";
import { cookies } from "next/headers";

export default async function AthletesPage() {
  const auth = await getServerAuthState();

  if (auth.isAuthenticated && auth.user?.id) {
    const cookie = (await cookies()).toString();
    return <AthletesHubOverview user={auth.user} cookie={cookie} />;
  }

  return <AthletesMarketing />;
}
