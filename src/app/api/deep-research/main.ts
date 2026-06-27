/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActivityTracker } from "./activity-tracker";
import { MAX_ITERATIONS, MIN_CONFIDENCE_TO_STOP } from "./constants";
import { analyzeFindings, generateReport, generateSearchQueries, processSearchResults, search } from "./research-functions";
import { ResearchState } from "./types";
import {
    completeResearchSession,
    updateResearchSessionSources,
} from "@/lib/session-store";

function getSourceTitle(source: string) {
    try {
        return new URL(source).hostname;
    } catch {
        return source;
    }
}


export async function deepResearch(researchState: ResearchState, dataStream: any){

    let iteration = 0;
    
    const activityTracker = createActivityTracker(dataStream, researchState);

    const initialQueries = await generateSearchQueries(researchState, activityTracker)
    let currentQueries = (initialQueries as any).searchQueries
    while(currentQueries && currentQueries.length > 0 && iteration < MAX_ITERATIONS){
        iteration++;

        console.log("We are running on the itration number: ", iteration);

        const searchResults = currentQueries.map((query: string) => search(query, researchState, activityTracker));
        const searchResultsResponses = await Promise.allSettled(searchResults)

        const allSearchResults = searchResultsResponses.filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value.length > 0).map(result => result.value).flat()

        console.log(`We got ${allSearchResults.length} search results!`)

const newFindings = await processSearchResults(
    allSearchResults, researchState, activityTracker
)

console.log("Results are processed!")

researchState.findings = [...researchState.findings, ...newFindings]

const analysis = await analyzeFindings(
    researchState,
    currentQueries,
    iteration, 
    activityTracker
)

console.log("Analysis: ", analysis)

const confidence = typeof analysis.confidence === "number" ? analysis.confidence : 0;

if(analysis.sufficient || confidence >= MIN_CONFIDENCE_TO_STOP){
    activityTracker.add(
        "analyze",
        "complete",
        `Confidence gate passed at ${Math.round(confidence * 100)}%. Moving to report generation.`
    );
    break;
}


        currentQueries = (analysis.queries || []).filter((query:string) => !currentQueries.includes(query));
    }

    console.log("We are outside of the loop with total iterations: ", iteration)

    const report = await generateReport(researchState, activityTracker);

    const sources = researchState.findings.map((finding) => ({
        url: finding.source,
        title: getSourceTitle(finding.source),
    }));

    if (researchState.sessionId) {
        await updateResearchSessionSources(researchState.sessionId, sources);
        await completeResearchSession(researchState.sessionId, {
            reportText: typeof report === "string" ? report : String(report),
            sources,
            activities: researchState.activities ?? [],
        });
    }

    dataStream.writeData({
        type: "report",
        content: report
    })

    dataStream.writeData({
        type: "session",
        content: {
            id: researchState.sessionId,
            status: "completed",
        }
    })

    return initialQueries;

}
