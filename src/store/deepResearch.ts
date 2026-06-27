import { Activity, Source } from "@/app/api/deep-research/types";
import { create } from "zustand";

export interface ClarificationPrompt {
  id: string;
  prompt: string;
  options: string[];
  customPlaceholder: string;
}

interface DeepResearchState {
  topic: string;
  questions: ClarificationPrompt[];
  answers: string[];
  currentQuestion: number;
  isCompleted: boolean;
  isLoading: boolean;
  activities: Activity[];
  sources: Source[];
  report: string;
  sessionId: string;
}

interface DeepResearchActions {
  setTopic: (topic: string) => void;
  setQuestions: (questions: ClarificationPrompt[]) => void;
  setAnswers: (answers: string[]) => void;
  setCurrentQuestion: (index: number) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setActivities: (activities: Activity[]) => void,
  setSources: (sources: Source[]) => void,
  setReport: (report: string) => void,
  setSessionId: (sessionId: string) => void,
  reset: () => void,
}

const initialState: DeepResearchState = {
  topic: "",
  questions: [],
  answers: [],
  currentQuestion: 0,
  isCompleted: false,
  isLoading: false,
  activities: [],
  sources: [],
  report: "",
  sessionId: "",
};

export const useDeepResearchStore = create<
  DeepResearchState & DeepResearchActions
>((set) => ({
  ...initialState,
  setTopic: (topic: string) => set({ topic }),
  setQuestions: (questions: ClarificationPrompt[]) => set({ questions }),
  setAnswers: (answers: string[]) => set({ answers }),
  setCurrentQuestion: (currentQuestion: number) => set({ currentQuestion }),
  setIsCompleted: (isCompleted: boolean) => set({ isCompleted }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setActivities: (activities: Activity[]) => set({ activities }),
  setSources: (sources: Source[]) => set({ sources }),
  setReport: (report: string) => set({ report }),
  setSessionId: (sessionId: string) => set({ sessionId }),
  reset: () => set(initialState),
}));
