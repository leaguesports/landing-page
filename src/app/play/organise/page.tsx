import { HUB_PLAY_HREF } from "@/lib/sports/hub-ia";
import { redirect } from "next/navigation";

/** Former global Organise hub — pick a sport on `/play` first (#212). */
export default function OrganiseHubRedirectPage() {
  redirect(HUB_PLAY_HREF);
}
