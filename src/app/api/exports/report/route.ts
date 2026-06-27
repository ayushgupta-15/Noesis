import { put } from "@vercel/blob";
import { getResearchSession } from "@/lib/session-store";
import { getExistingVisitorId } from "@/lib/session-owner";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function extractReportContent(report: string) {
  if (!report.includes("<report>")) return report;
  return report.split("<report>")[1]?.split("</report>")[0] ?? report;
}

function safeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "noesis-report";
}

export async function POST(req: Request) {
  const visitorId = await getExistingVisitorId();

  if (!visitorId) {
    return Response.json(
      { success: false, error: "No active research visitor session." },
      { status: 401 }
    );
  }

  const ip = getClientIp(req);
  const limit = rateLimit({
    key: `export:${visitorId}:${ip}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    return Response.json(
      { success: false, error: "Too many export requests. Please retry later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter),
        },
      }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        success: false,
        error: "Blob export is not configured. Set BLOB_READ_WRITE_TOKEN.",
      },
      { status: 501 }
    );
  }

  const body = await req.json();
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const fallbackReportText =
    typeof body.reportText === "string" ? body.reportText : "";
  const fallbackTopic = typeof body.topic === "string" ? body.topic : "Noesis report";

  const session = sessionId
    ? await getResearchSession(sessionId, visitorId)
    : null;

  const reportText = extractReportContent(
    session?.reportText || fallbackReportText
  ).trim();
  const topic = session?.topic || fallbackTopic;

  if (reportText.length < 20) {
    return Response.json(
      { success: false, error: "A completed report is required before export." },
      { status: 400 }
    );
  }

  const fileName = `${safeFilePart(topic)}-${session?.id ?? crypto.randomUUID()}.md`;
  const blob = await put(`reports/${fileName}`, reportText, {
    access: "public",
    contentType: "text/markdown; charset=utf-8",
  });

  return Response.json({
    success: true,
    url: blob.url,
    pathname: blob.pathname,
  });
}
