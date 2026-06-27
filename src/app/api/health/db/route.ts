import { checkSessionStore } from "@/lib/session-store";

export const runtime = "nodejs";

export async function GET() {
  const status = await checkSessionStore();

  return Response.json(
    {
      success: status.ok,
      mode: status.mode,
      message: status.message,
    },
    { status: status.ok ? 200 : 503 }
  );
}
