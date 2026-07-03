import { requireAdmin } from "@/server/auth";
import { EngagementEmbed } from "./EngagementEmbed";

export const dynamic = "force-dynamic";

export default async function EngagementPage() {
  await requireAdmin();
  return <EngagementEmbed />;
}
