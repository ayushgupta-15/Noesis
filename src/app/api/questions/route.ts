import { NextResponse } from "next/server";
import { getExaClient } from "@/app/api/deep-research/services";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getOrCreateVisitorId } from "@/lib/session-owner";

export const runtime = "nodejs";

interface ClarificationPrompt {
  id: string;
  prompt: string;
  options: string[];
  customPlaceholder: string;
}

function cleanTitle(title: string) {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s*[-–—|]\s*(arXiv|IEEE|ACM|Springer|ScienceDirect|MDPI|Nature|ResearchGate|Medium|YouTube).*$/i, "")
    .replace(/^(A|An|The)\s+/i, "")
    .trim();
}

function dedupeOptions(options: string[]) {
  const seen = new Set<string>();

  return options
    .map((option) => option.trim())
    .filter((option) => option.length >= 12)
    .filter((option) => {
      const key = option.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

async function discoverNearbyTopics(topic: string) {
  try {
    const exa = getExaClient();
    const year = new Date().getFullYear();
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const queries = [
      `${topic} recent trends research ${year}`,
      `${topic} latest research papers applications challenges`,
    ];

    const responses = await Promise.allSettled(
      queries.map((query) =>
        exa.searchAndContents(query, {
          type: "keyword",
          numResults: 5,
          startPublishedDate: oneYearAgo,
          endPublishedDate: now,
          text: {
            maxCharacters: 500,
          },
        })
      )
    );

    const titles = responses
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value.results)
      .map((result) => cleanTitle(result.title || ""))
      .filter(Boolean)
      .map((title) => (title.length > 96 ? `${title.slice(0, 93)}...` : title));

    return dedupeOptions(titles);
  } catch (error) {
    console.warn("Topic discovery failed. Falling back to local topic options.", error);
    return [];
  }
}

function fallbackNearbyTopics(topic: string) {
  return [
    `${topic} recent research directions`,
    `${topic} best practices and implementation patterns`,
    `${topic} technical methods, metrics, and benchmarks`,
    `${topic} limitations, risks, and open problems`,
  ];
}

async function clarifyResearchGoals(topic: string): Promise<ClarificationPrompt[]> {
  const discoveredTopics = await discoverNearbyTopics(topic);
  const nearbyTopicOptions =
    discoveredTopics.length >= 3 ? discoveredTopics : fallbackNearbyTopics(topic);

  return [
    {
      id: "nearby_topic",
      prompt: `Which current or nearby direction should Noēsis investigate for ${topic}?`,
      options: nearbyTopicOptions,
      customPlaceholder: "Write a specific related topic, trend, paper area, or subproblem...",
    },
    {
      id: "research_goal",
      prompt: `What should the ${topic} report optimize for?`,
      options: [
        `Compare the strongest current approaches in ${topic}`,
        `Extract best practices and implementation guidance for ${topic}`,
        `Map recent papers, benchmarks, and evaluation criteria for ${topic}`,
        `Identify risks, limitations, and unsolved problems in ${topic}`,
      ],
      customPlaceholder: "Write the outcome you want from this report...",
    },
    {
      id: "source_scope",
      prompt: "Which source scope should guide the search?",
      options: [
        `Recent academic papers and surveys about ${topic}`,
        `Production systems, case studies, and engineering writeups about ${topic}`,
        `Benchmarks, datasets, and evaluation studies for ${topic}`,
        `Balanced mix of academic and practical sources for ${topic}`,
      ],
      customPlaceholder: "Add a time range, geography, industry, venue, or source type...",
    },
    {
      id: "constraints",
      prompt: "Any constraints or exclusions?",
      options: [
        "Prefer primary sources and peer-reviewed references",
        "Avoid vendor-heavy or marketing-led sources",
        "Include tradeoffs, edge cases, and failure modes",
        "No special constraints",
      ],
      customPlaceholder: "Write sources, viewpoints, or constraints to include/avoid...",
    },
  ];
}

export async function POST(req: Request) {
  try {
    await getOrCreateVisitorId();

    const ip = getClientIp(req);
    const limit = rateLimit({
      key: `questions:${ip}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many topic-brief requests. Please retry later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfter),
          },
        }
      );
    }

    const { topic } = await req.json();

    if (typeof topic !== "string" || topic.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Topic must be at least 2 characters." },
        { status: 400 }
      );
    }

    const questions = await clarifyResearchGoals(topic.trim());
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Error while generating questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate questions." },
      { status: 500 }
    );
  }
}
