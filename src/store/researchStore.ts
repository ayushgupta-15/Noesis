/**
 * Zustand store for research state management
 * Enhanced for FastAPI backend integration
 */
import { create } from "zustand";

export interface ResearchState {
  // Research metadata
  researchId: string | null;
  topic: string;
  clarifications: Record<string, string>;
  status: string;

  // Progress tracking
  iteration: number;
  maxIterations: number;

  // AI Copilot data
  queryReasoning: string;
  analysisReasoning: string;
  currentQueries: string[];
  gaps: string[];
  coverage: number;
  validation: {
    is_valid: boolean;
    confidence: number;
    concerns: string[];
  } | null;

  // Analytics
  analytics: {
    totalQueries: number;
    totalSearches: number;
    cacheHits: number;
    cacheHitRate: number;
    totalTokens: number;
    totalFindings: number;
    iterationsCompleted: number;
    durationSeconds: number;
    queryEfficiency: number;
    sourceDiversity: number;
  } | null;

  // Results
  findings: any[];
  report: string;

  // UI state
  isStreaming: boolean;
  error: string | null;

  // Actions
  setResearchId: (id: string) => void;
  setTopic: (topic: string) => void;
  setClarifications: (clarifications: Record<string, string>) => void;
  setStatus: (status: string) => void;
  updateFromStream: (update: any) => void;
  setAnalytics: (analytics: any) => void;
  setReport: (report: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  researchId: null,
  topic: "",
  clarifications: {},
  status: "idle",
  iteration: 0,
  maxIterations: 5,
  queryReasoning: "",
  analysisReasoning: "",
  currentQueries: [],
  gaps: [],
  coverage: 0,
  validation: null,
  analytics: null,
  findings: [],
  report: "",
  isStreaming: false,
  error: null,
};

export const useResearchStore = create<ResearchState>((set) => ({
  ...initialState,

  setResearchId: (id) => set({ researchId: id }),

  setTopic: (topic) => set({ topic }),

  setClarifications: (clarifications) => set({ clarifications }),

  setStatus: (status) => set({ status, isStreaming: status !== "completed" && status !== "failed" }),

  updateFromStream: (update) => {
    set((state) => {
      const newState: Partial<ResearchState> = {
        status: update.status || state.status,
        iteration: update.iteration || state.iteration,
      };

      // Handle different update types
      if (update.data) {
        switch (update.data.type) {
          case "query_generation":
            newState.currentQueries = update.data.queries || [];
            newState.queryReasoning = update.data.reasoning || "";
            break;

          case "search":
            newState.findings = [
              ...state.findings,
              ...(update.data.findings || []),
            ];
            break;

          case "analysis":
            newState.coverage = update.data.coverage || 0;
            newState.gaps = update.data.gaps || [];
            newState.analysisReasoning = update.data.reasoning || "";
            break;

          case "validation":
            newState.validation = {
              is_valid: update.data.is_valid,
              confidence: update.data.confidence,
              concerns: update.data.concerns || [],
            };
            break;

          case "report":
            newState.report = update.data.content || "";
            newState.status = "completed";
            newState.isStreaming = false;
            break;
        }
      }

      return { ...state, ...newState };
    });
  },

  setAnalytics: (analytics) => set({ analytics }),

  setReport: (report) => set({ report }),

  setError: (error) => set({ error, isStreaming: false }),

  reset: () => set(initialState),
}));
