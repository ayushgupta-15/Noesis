import { listResearchSessions } from "@/lib/session-store";
import { getExistingVisitorId } from "@/lib/session-owner";

export const runtime = "nodejs";

export async function GET() {
  const visitorId = await getExistingVisitorId();
  const sessions = visitorId ? await listResearchSessions(visitorId) : [];
  return Response.json({ success: true, sessions });
}
