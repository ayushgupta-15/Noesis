/* eslint-disable @typescript-eslint/no-explicit-any */
import { appendResearchSessionActivity } from '@/lib/session-store';
import { Activity, ResearchState } from './types';


export const createActivityTracker = (dataStream: any, researchState: ResearchState) => {

    return {
        add: (type: Activity['type'], status: Activity['status'], message: Activity['message'] ) => {
            const activity = {
                type,
                status,
                message,
                timestamp: Date.now(),
                completedSteps: researchState.completedSteps,
                tokenUsed: researchState.tokenUsed
            };

            researchState.activities?.push(activity);

            dataStream.writeData({
                type: "activity",
                content: activity
            })

            if (researchState.sessionId) {
                void appendResearchSessionActivity(researchState.sessionId, activity);
            }
        }
    }
}
