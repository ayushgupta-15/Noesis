/**
 * Custom hook for research operations
 */
import { useCallback, useEffect } from "react";
import { useResearchStore } from "@/store/researchStore";
import {
  createResearch,
  streamResearch,
  getAnalytics,
  exportPDF,
  exportCSV,
  downloadBlob,
} from "@/lib/api-client";
import { toast } from "sonner";

export function useResearch() {
  const store = useResearchStore();

  /**
   * Start a new research task
   */
  const startResearch = useCallback(
    async (topic: string, clarifications: Record<string, string>) => {
      try {
        store.reset();
        store.setTopic(topic);
        store.setClarifications(clarifications);
        store.setStatus("initializing");

        // Create research task
        const response = await createResearch({
          topic,
          clarifications,
        });

        store.setResearchId(response.research_id);
        store.setStatus(response.status);

        toast.success("Research initialized successfully");

        // Start streaming
        const cleanup = streamResearch(
          response.research_id,
          (update) => {
            store.updateFromStream(update);
          },
          (error) => {
            store.setError(error.message);
            toast.error(`Research error: ${error.message}`);
          },
          async () => {
            // Research completed, fetch analytics
            try {
              const analytics = await getAnalytics(response.research_id);
              store.setAnalytics(analytics);
              toast.success("Research completed!");
            } catch (err) {
              console.error("Failed to fetch analytics:", err);
            }
          }
        );

        return cleanup;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        store.setError(message);
        toast.error(`Failed to start research: ${message}`);
        throw error;
      }
    },
    [store]
  );

  /**
   * Export research as PDF
   */
  const exportAsPDF = useCallback(async () => {
    if (!store.researchId) {
      toast.error("No research to export");
      return;
    }

    try {
      toast.info("Generating PDF...");
      const blob = await exportPDF(store.researchId);
      downloadBlob(blob, `research_${store.researchId}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to export PDF: ${message}`);
    }
  }, [store.researchId]);

  /**
   * Export research as CSV
   */
  const exportAsCSV = useCallback(async () => {
    if (!store.researchId) {
      toast.error("No research to export");
      return;
    }

    try {
      toast.info("Generating CSV...");
      const blob = await exportCSV(store.researchId);
      downloadBlob(blob, `research_${store.researchId}.csv`);
      toast.success("CSV exported successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to export CSV: ${message}`);
    }
  }, [store.researchId]);

  return {
    // State
    researchId: store.researchId,
    topic: store.topic,
    status: store.status,
    iteration: store.iteration,
    isStreaming: store.isStreaming,
    error: store.error,

    // Copilot data
    queryReasoning: store.queryReasoning,
    analysisReasoning: store.analysisReasoning,
    currentQueries: store.currentQueries,
    gaps: store.gaps,
    coverage: store.coverage,
    validation: store.validation,

    // Analytics
    analytics: store.analytics,

    // Results
    findings: store.findings,
    report: store.report,

    // Actions
    startResearch,
    exportAsPDF,
    exportAsCSV,
    reset: store.reset,
  };
}
