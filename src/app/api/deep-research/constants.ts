// Research constants
export const MAX_ITERATIONS = 3; // Maximum number of iterations
export const MAX_SEARCH_RESULTS = 5; // Maximum number of search results
export const MAX_CONTENT_CHARS = 20000; // Maximum number of characters in the content
export const MAX_RETRY_ATTEMPTS = 1; // Retries per model before trying the next fallback
export const RETRY_DELAY_MS = 1000; // Delay in milliseconds between retries for the model to call LLMs

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
