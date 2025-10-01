"use client";

import { useState } from "react";
import { useResearch } from "@/hooks/useResearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CopilotPanel from "./CopilotPanel";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ResearchReport from "./ResearchReport";
import { Download, FileText, Loader2 } from "lucide-react";

export default function EnhancedResearchUI() {
  const research = useResearch();
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* Status Bar */}
      {research.researchId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Research ID: {research.researchId}</p>
                <p className="text-lg font-semibold">
                  Status: {research.status}
                  {research.isStreaming && (
                    <Loader2 className="inline-block ml-2 w-4 h-4 animate-spin" />
                  )}
                </p>
                <p className="text-sm">Iteration: {research.iteration}</p>
              </div>

              {/* Export Buttons */}
              {research.report && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={research.exportAsPDF}
                    disabled={research.isStreaming}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={research.exportAsCSV}
                    disabled={research.isStreaming}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    {showAnalytics ? "Hide" : "Show"} Analytics
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copilot Panel - Real-time insights */}
      {research.isStreaming && (
        <CopilotPanel
          queryReasoning={research.queryReasoning}
          analysisReasoning={research.analysisReasoning}
          queries={research.currentQueries}
          gaps={research.gaps}
          coverage={research.coverage}
          validation={research.validation || undefined}
        />
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && research.analytics && (
        <AnalyticsDashboard {...research.analytics} />
      )}

      {/* Research Report */}
      {research.report && (
        <ResearchReport content={research.report} topic={research.topic} />
      )}

      {/* Error Display */}
      {research.error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{research.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
