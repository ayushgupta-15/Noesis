/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActivityTracker,
  AnalysisResult,
  ResearchFindings,
  ResearchState,
  SearchResult,
} from "./types";
import { z } from "zod";
import {
  ANALYSIS_SYSTEM_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
  getAnalysisPrompt,
  getExtractionPrompt,
  getReportPrompt,
  REPORT_SYSTEM_PROMPT,
} from "./prompts";
import { callModel } from "./model-caller";
import { getExaClient } from "./services";
import { combineFindings, handleError } from "./utils";
import {
  MAX_CONTENT_CHARS,
  MAX_ITERATIONS,
  MAX_SEARCH_RESULTS,
  MODELS,
} from "./constants";

export async function generateSearchQueries(
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {
  activityTracker.add("planning","pending","Planning the research");

  const topic = researchState.topic.trim();
  const clarifications = researchState.clarificationsText.toLowerCase();
  const wantsPapers = clarifications.includes("paper") || clarifications.includes("research");
  const wantsTechnical = clarifications.includes("technical");

  const searchQueries = [
    wantsPapers
      ? `${topic} research paper survey best practices`
      : `${topic} best practices`,
    wantsTechnical
      ? `${topic} technical methods algorithms evaluation`
      : `${topic} implementation guide examples`,
    `${topic} recent advances challenges limitations`,
  ];

  researchState.completedSteps++;
  activityTracker.add("planning", "complete", "Crafted the local research plan");

  return { searchQueries };
}

function summarizeLocally(content: string, topic: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 80);
  const topicTerms = topic.toLowerCase().split(/\s+/).filter(Boolean);
  const ranked = sentences
    .map((sentence) => ({
      sentence,
      score: topicTerms.reduce(
        (score, term) => score + (sentence.toLowerCase().includes(term) ? 1 : 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ sentence }) => sentence);

  const selected = ranked.length > 0 ? ranked : sentences.slice(0, 5);

  return selected.join("\n\n").slice(0, 3500) || normalized.slice(0, 1500);
}

function buildLocalReport(researchState: ResearchState) {
  const findings = researchState.findings;
  const sources = [...new Set(findings.map((finding) => finding.source))];

  const findingsMarkdown = findings
    .slice(0, 12)
    .map(
      (finding, index) =>
        `### Finding ${index + 1}\n\n${finding.summary}\n\nSource: ${finding.source}`
    )
    .join("\n\n");

  const sourcesMarkdown = sources
    .map((source, index) => `${index + 1}. ${source}`)
    .join("\n");

  return `<report>
# ${researchState.topic}

## Executive Summary

This report was generated from live web search results and local extraction because the configured LLM provider was unavailable or rate-limited. It summarizes the most relevant collected sources and should be treated as a research draft for review.

## Key Findings

${findingsMarkdown || "No usable findings were collected. Check the Exa API key, query terms, and network access."}

## Practical Takeaways

- Compare methods by robustness, imperceptibility, capacity, and computational cost.
- Prioritize recent survey papers and benchmark studies when evaluating technical best practices.
- Validate claims against the cited sources before using the report as final research output.

## Sources

${sourcesMarkdown || "No sources collected."}
</report>`;
}

export async function search(
  query: string,
  researchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<SearchResult[]> {

    activityTracker.add("search","pending",`Searching for ${query}`);

  try {
    const exa = getExaClient();
    const searchResult = await exa.searchAndContents(query, {
      type: "keyword",
      numResults: MAX_SEARCH_RESULTS,
      startPublishedDate: new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endPublishedDate: new Date().toISOString(),
      startCrawlDate: new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endCrawlDate: new Date().toISOString(),
      excludeDomains: ["https://youtube.com"],
      text: {
        maxCharacters: MAX_CONTENT_CHARS,
      },
    });

    const filteredResults = searchResult.results
      .filter((r) => r.title && r.text !== undefined)
      .map((r) => ({
        title: r.title || "",
        url: r.url,
        content: r.text || "",
      }))
      .filter((result) => {
        if (researchState.processedUrls.has(result.url)) {
          return false;
        }

        researchState.processedUrls.add(result.url);
        return true;
      });

    researchState.completedSteps++;

    activityTracker.add("search","complete",`Found ${filteredResults.length} results for ${query}`);


    return filteredResults;
  } catch (error) {
    console.log("error: ", error);
    return handleError(error, `Searching for ${query}`, activityTracker, "search", []) || []
  }
}

export async function extractContent(
  content: string,
  url: string,
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {

    try{
        activityTracker.add("extract","pending",`Extracting content from ${url}`);

        const result = await callModel(
          {
            model: MODELS.EXTRACTION,
            prompt: getExtractionPrompt(
              content,
              researchState.topic,
              researchState.clarificationsText
            ),
            system: EXTRACTION_SYSTEM_PROMPT,
            schema: z.object({
              summary: z.string().describe("A comprehensive summary of the content"),
            }),
            activityType: "extract"
          },
          researchState, activityTracker
        );
      
        activityTracker.add("extract","complete",`Extracted content from ${url}`);
      
        return {
          url,
          summary: (result as any).summary,
        };
    }catch(error){
        handleError(error, `Content extraction from ${url}`, activityTracker, "extract", null);
        const summary = summarizeLocally(content, researchState.topic);

        if (!summary) {
          return null;
        }

        researchState.completedSteps++;
        activityTracker.add("extract","complete",`Extracted content locally from ${url}`);

        return {
          url,
          summary,
        };
    }
}

export async function processSearchResults(
  searchResults: SearchResult[],
  researchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<ResearchFindings[]> {
  const extractionPromises = searchResults.map((result) =>
    extractContent(result.content, result.url, researchState, activityTracker)
  );
  const extractionResults = await Promise.allSettled(extractionPromises);

  type ExtractionResult = { url: string; summary: string };

  const newFindings = extractionResults
    .filter(
      (result): result is PromiseFulfilledResult<ExtractionResult> =>
        result.status === "fulfilled" &&
        result.value !== null &&
        result.value !== undefined
    )
    .map((result) => {
      const { summary, url } = result.value;
      return {
        summary,
        source: url,
      };
    });

  return newFindings;
}

export async function analyzeFindings(
  researchState: ResearchState,
  currentQueries: string[],
  currentIteration: number,
  activityTracker: ActivityTracker
): Promise<AnalysisResult> {
  try {
    activityTracker.add("analyze","pending",`Analyzing research findings (iteration ${currentIteration}) of ${MAX_ITERATIONS}`);
    const contentText = combineFindings(researchState.findings);

    const result = await callModel(
      {
        model: MODELS.ANALYSIS,
        prompt: getAnalysisPrompt(
          contentText,
          researchState.topic,
          researchState.clarificationsText,
          currentQueries,
          currentIteration,
          MAX_ITERATIONS,
          contentText.length
        ),
        system: ANALYSIS_SYSTEM_PROMPT,
        schema: z.object({
          sufficient: z
            .boolean()
            .describe(
              "Whether the collected content is sufficient for a useful report"
            ),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Confidence that the findings can support a strong final report"),
          gaps: z.array(z.string()).describe("Identified gaps in the content"),
          queries: z
            .array(z.string())
            .describe(
              "Search queries for missing informationo. Max 3 queries."
            ),
        }),
        activityType: "analyze"
      },
      researchState, activityTracker
    );

    const isContentSufficient = typeof result !== 'string' && result.sufficient; 

    activityTracker.add("analyze","complete",`Analyzed collected research findings: ${isContentSufficient ? 'Content is sufficient' : 'More research is needed!'}`);

    return result as AnalysisResult;
  } catch (error) {
    handleError(error, `Content analysis`, activityTracker, "analyze", null);

    const sourceCount = new Set(researchState.findings.map((finding) => finding.source)).size;
    const confidence = Math.min(0.9, sourceCount / 6 + currentIteration * 0.12);
    const sufficient = sourceCount >= 5 || currentIteration >= MAX_ITERATIONS;
    const gaps = sufficient
      ? []
      : ["More source diversity would improve the report."];

    activityTracker.add(
      "analyze",
      "complete",
      `Analyzed findings locally with ${Math.round(confidence * 100)}% confidence.`
    );

    return {
      sufficient,
      confidence,
      gaps,
      queries: sufficient
        ? []
        : [`${researchState.topic} survey benchmark comparison`, `${researchState.topic} limitations challenges`],
    };
  }
}

export async function generateReport(researchState: ResearchState, activityTracker: ActivityTracker) {
  try {
    activityTracker.add("generate","pending",`Geneating comprehensive report!`);

    const contentText = combineFindings(researchState.findings);

    const report = await callModel(
      {
        model: MODELS.REPORT,
        prompt: getReportPrompt(
          contentText,
          researchState.topic,
          researchState.clarificationsText
        ),
        system: REPORT_SYSTEM_PROMPT,
        activityType: "generate"
      },
      researchState, activityTracker
    );

    activityTracker.add("generate","complete",`Generated comprehensive report, Total tokens used: ${researchState.tokenUsed}. Research completed in ${researchState.completedSteps} steps.`);

    return report;
  } catch (error) {
    handleError(error, `Report Generation`, activityTracker, "generate", null);
    const report = buildLocalReport(researchState);
    activityTracker.add("generate","complete",`Generated local report from ${researchState.findings.length} findings.`);
    return report;
  }
}
