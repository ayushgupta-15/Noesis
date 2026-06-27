import { generateObject, generateText } from "ai";
import { openrouter } from "./services";
import { ActivityTracker, ModelCallOptions, ResearchState } from "./types";
import { MAX_RETRY_ATTEMPTS, MODEL_FALLBACKS, RETRY_DELAY_MS } from "./constants";
import { delay } from "./utils";


export async function callModel<T>({
    model, prompt, system, schema, activityType = "generate"
}: ModelCallOptions<T>,
researchState: ResearchState,activityTracker: ActivityTracker ): Promise<T | string>{

  let lastError: Error | null = null;
  const models = [model, ...(MODEL_FALLBACKS[model] ?? [])];

  for (const currentModel of models) {
    let attempts = 0;

    while(attempts < MAX_RETRY_ATTEMPTS){
      try{
        if(schema){

          const { object, usage } = await generateObject({
              model: openrouter(currentModel),
              prompt,
              system,
              schema: schema
            });

            researchState.tokenUsed += usage.totalTokens;
            researchState.completedSteps++

            return object;
          }else{

              const { text, usage } = await generateText({
                  model: openrouter(currentModel),
                  prompt,
                  system,
                });

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
