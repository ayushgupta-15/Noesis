import { createDataStreamResponse } from "ai";
import { ResearchState } from "./types";
import { deepResearch } from "./main";
import {
  createResearchSession,
  failResearchSession,
} from "@/lib/session-store";
import { getOrCreateVisitorId } from "@/lib/session-owner";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const visitorId = await getOrCreateVisitorId();
    const ip = getClientIp(req);
    const limit = rateLimit({
      key: `deep-research:${visitorId}:${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      return Response.json(
        {
          success: false,
          error: "Too many research runs. Please retry later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfter),
          },
        }
      );
    }

    const {messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { success: false, error: "Messages are required." },
        { status: 400 }
      );
    }

    const lastMessageContent = messages[messages.length - 1].content; 

    const parsed = JSON.parse(lastMessageContent);

    const topic = parsed.topic;
    const clarifications = parsed.clarifications;

    if (typeof topic !== "string" || topic.trim().length < 2) {
      return Response.json(
        { success: false, error: "Topic must be at least 2 characters." },
        { status: 400 }
      );
    }

    const session = await createResearchSession({
      topic: topic.trim(),
      ownerId: visitorId,
      metadata: {
        clarifications: clarifications ?? [],
      },
    });


    return createDataStreamResponse({
        execute: async (dataStream) => {
        const researchState: ResearchState = {
            topic: topic.trim(),
            completedSteps: 0,
            tokenUsed: 0,
            findings: [],
            processedUrls: new Set(),
            clarificationsText: JSON.stringify(clarifications ?? []),
            sessionId: session.id,
            activities: [],
        }

        dataStream.writeData({
          type: "session",
          content: {
            id: session.id,
            status: "running",
          },
        });

        try {
          await deepResearch(researchState, dataStream)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Research failed.";

          researchState.activities?.push({
            type: "generate",
            status: "error",
            message,
            timestamp: Date.now(),
            completedSteps: researchState.completedSteps,
            tokenUsed: researchState.tokenUsed,
          });

          await failResearchSession(session.id, researchState.activities ?? []);

          dataStream.writeData({
            type: "activity",
            content: {
              type: "generate",
              status: "error",
              message,
              timestamp: Date.now(),
              completedSteps: researchState.completedSteps,
              tokenUsed: researchState.tokenUsed,
            },
          });

          dataStream.writeData({
            type: "session",
            content: {
              id: session.id,
              status: "failed",
            },
          });
        }
        
      
        },
        // onError: error => `Custom error: ${error.message}`,
      });
  } catch (error) {

    return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message: "Invalid message format."
        },
        { status: 400 }
      );
      
  }
}
