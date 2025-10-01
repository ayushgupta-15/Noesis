"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Lightbulb, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface CopilotPanelProps {
  queryReasoning?: string;
  analysisReasoning?: string;
  queries?: string[];
  gaps?: string[];
  coverage?: number;
  validation?: {
    is_valid: boolean;
    confidence: number;
    concerns: string[];
  };
}

export default function CopilotPanel({
  queryReasoning,
  analysisReasoning,
  queries = [],
  gaps = [],
  coverage = 0,
  validation
}: CopilotPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle>AI Copilot Insights</CardTitle>
          </div>
          <Badge variant={validation?.is_valid ? "default" : "secondary"}>
            {validation ? `${(validation.confidence * 100).toFixed(0)}% Confidence` : "Analyzing..."}
          </Badge>
        </div>
        <CardDescription>
          Understanding the AI's research strategy and decisions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Query Strategy */}
        {queryReasoning && queries.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Query Strategy</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-3 space-y-3">
              <div className="pl-6 space-y-2">
                <p className="text-sm text-muted-foreground">{queryReasoning}</p>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Generated Queries:</p>
                  {queries.map((query, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-mono">{idx + 1}.</span>
                      <span className="text-foreground">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Coverage Analysis */}
        {analysisReasoning && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium">Coverage Analysis</span>
                <Badge variant="outline">{(coverage * 100).toFixed(0)}%</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-3">
              <div className="pl-6 space-y-3">
                <p className="text-sm text-muted-foreground">{analysisReasoning}</p>

                {gaps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Knowledge Gaps Identified:</p>
                    {gaps.map((gap, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{gap}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Validation Results */}
        {validation && (
          <div className="p-3 rounded-lg bg-accent/50">
            <div className="flex items-center gap-2 mb-2">
              {validation.is_valid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="font-medium text-sm">
                {validation.is_valid ? "Findings Validated" : "Validation Concerns"}
              </span>
            </div>

            {validation.concerns.length > 0 && (
              <ul className="space-y-1 pl-6">
                {validation.concerns.map((concern, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground list-disc">
                    {concern}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Responsible AI Notice */}
        <div className="pt-3 border-t text-xs text-muted-foreground">
          <p>
            🤖 <strong>Transparency Note:</strong> This panel shows how the AI makes research decisions,
            what queries it generates, and why. This transparency helps you understand and trust the research process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
