import { getResearchSession } from "@/lib/session-store";
import { getExistingVisitorId } from "@/lib/session-owner";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitorId = await getExistingVisitorId();
  const session = visitorId ? await getResearchSession(id, visitorId) : null;

  if (!session) {
    return Response.json(
      { success: false, error: "Session not found." },
      { status: 404 }
    );
  }

  return Response.json({ success: true, session });
}
