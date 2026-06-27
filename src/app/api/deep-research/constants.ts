// Research constants
export const MAX_ITERATIONS = 3; // Maximum number of iterations
export const MAX_SEARCH_RESULTS = 3; // Maximum number of search results per query
export const MAX_CONTENT_CHARS = 12000; // Maximum number of characters in each search result
export const MAX_RETRY_ATTEMPTS = 1; // Retries per model before trying the next fallback
export const RETRY_DELAY_MS = 1000; // Delay in milliseconds between retries for the model to call LLMs
export const MODEL_CALL_TIMEOUT_MS = {
  planning: 20_000,
  search: 20_000,
  extract: 28_000,
  analyze: 35_000,
  generate: 45_000,
} as const;

// Model names. Free endpoints can be rate-limited upstream, so every stage has fallbacks.
export const MODELS = {
  PLANNING: "meta-llama/llama-3.3-70b-instruct:free",
  EXTRACTION: "qwen/qwen-2.5-7b-instruct",
  ANALYSIS: "qwen/qwen-2.5-7b-instruct",
  REPORT: "meta-llama/llama-3.3-70b-instruct:free",
};

export const MODEL_FALLBACKS: Record<string, string[]> = {
  "meta-llama/llama-3.3-70b-instruct:free": [
    "cohere/north-mini-code:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
  ],
  "qwen/qwen-2.5-7b-instruct": [
    "meta-llama/llama-3.3-70b-instruct:free",
    "cohere/north-mini-code:free",
  ],
};

export const MIN_CONFIDENCE_TO_STOP = 0.78;
