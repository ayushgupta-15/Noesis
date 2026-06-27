import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import Exa from "exa-js"

export const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
  });

export function getExaClient() {
  const apiKey = process.env.EXA_SEARCH_API_KEY || process.env.EXASEARCH_API_KEY;

  if (!apiKey) {
    throw new Error("Missing EXA_SEARCH_API_KEY environment variable.");
  }

  return new Exa(apiKey);
}
