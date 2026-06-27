import { generateObject, generateText } from "ai";
import { openrouter } from "./services";
import { ActivityTracker, ModelCallOptions, ResearchState } from "./types";
import {
  MAX_RETRY_ATTEMPTS,
  MODEL_CALL_TIMEOUT_MS,
  MODEL_FALLBACKS,
  RETRY_DELAY_MS,
} from "./constants";
import { delay } from "./utils";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

export async function callModel<T>({
    model, prompt, system, schema, activityType = "generate"
}: ModelCallOptions<T>,
researchState: ResearchState,activityTracker: ActivityTracker ): Promise<T | string>{

  let lastError: Error | null = null;
  const models = [model, ...(MODEL_FALLBACKS[model] ?? [])];
  const timeoutMs = MODEL_CALL_TIMEOUT_MS[activityType] ?? MODEL_CALL_TIMEOUT_MS.generate;

  for (const currentModel of models) {
    let attempts = 0;

    while(attempts < MAX_RETRY_ATTEMPTS){
      try{
        if(schema){

          const { object, usage } = await withTimeout(generateObject({
              model: openrouter(currentModel),
              prompt,
              system,
              schema: schema
            }), timeoutMs, `${activityType} model ${currentModel}`);

            researchState.tokenUsed += usage.totalTokens;
            researchState.completedSteps++

            return object;
          }else{

              const { text, usage } = await withTimeout(generateText({
                  model: openrouter(currentModel),
                  prompt,
                  system,
                }), timeoutMs, `${activityType} model ${currentModel}`);

                researchState.tokenUsed += usage.totalTokens;
            researchState.completedSteps++

            return text;
          }
      }catch(error){
        attempts++;
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if(attempts < MAX_RETRY_ATTEMPTS){
          activityTracker.add(activityType, 'warning', `${currentModel} failed, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}. Retrying...`)
        }
        await delay(RETRY_DELAY_MS*attempts)
      }
    }

    const nextModel = models[models.indexOf(currentModel) + 1];
    if (nextModel) {
      activityTracker.add(activityType, "warning", `${currentModel} failed. Trying ${nextModel}.`);
    }
  }

  throw lastError || new Error(`Failed after trying ${models.length} model(s).`)
}
