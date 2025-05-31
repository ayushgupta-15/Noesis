// Research constants
export const MAX_ITERATIONS = 3; // Maximum number of iterations
export const MAX_SEARCH_RESULTS = 5; // Maximum number of search results
export const MAX_CONTENT_CHARS = 20000; // Maximum number of characters in the content
export const MAX_RETRY_ATTEMPTS = 3; // Number of times the model will try to call LLMs if it fails
export const RETRY_DELAY_MS = 1000; // Delay in milliseconds between retries for the model to call LLMs

// Model names (All are free and valid on OpenRouter)
export const MODELS = {
  PLANNING: "meta-llama/llama-3.2-3b-instruct",      // Free and fast for planning
  EXTRACTION: "mistralai/mistral-7b-instruct",        // Good at summarizing/extracting info
  ANALYSIS: "qwen/qwen1.5-7b-chat",                   // Strong reasoning at zero cost
  REPORT: "meta-llama/llama-3.2-3b-instruct"          // Reliable for generating final reports
};
