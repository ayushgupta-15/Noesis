"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Clock,
  Search,
  Database,
  Zap,
  TrendingUp,
  CheckCircle2,
  Globe
} from "lucide-react";

interface AnalyticsProps {
  totalQueries?: number;
  totalSearches?: number;
  cacheHits?: number;
  cacheHitRate?: number;
  totalTokens?: number;
  totalFindings?: number;
  iterationsCompleted?: number;
  durationSeconds?: number;
  queryEfficiency?: number;
  sourceDiversity?: number;
}

export default function AnalyticsDashboard({
  totalQueries = 0,
  totalSearches = 0,
  cacheHits = 0,
  cacheHitRate = 0,
  totalTokens = 0,
  totalFindings = 0,
  iterationsCompleted = 0,
  durationSeconds = 0,
  queryEfficiency = 0,
  sourceDiversity = 0
}: AnalyticsProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(0)}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const metrics = [
    {
      icon: Search,
      label: "Total Queries",
      value: totalQueries,
      color: "text-blue-500"
    },
    {
      icon: Database,
      label: "Searches Executed",
      value: totalSearches,
      color: "text-purple-500"
    },
    {
      icon: Zap,
      label: "Cache Hits",
      value: cacheHits,
      badge: `${(cacheHitRate * 100).toFixed(0)}%`,
      color: "text-green-500"
    },
    {
      icon: CheckCircle2,
      label: "Findings",
      value: totalFindings,
      color: "text-emerald-500"
    },
    {
      icon: BarChart3,
      label: "Tokens Used",
      value: formatNumber(totalTokens),
      color: "text-orange-500"
    },
    {
      icon: Clock,
      label: "Duration",
      value: formatDuration(durationSeconds),
      color: "text-pink-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Research Analytics</CardTitle>
          </div>
          <Badge variant="outline">{iterationsCompleted} iterations</Badge>
        </div>
        <CardDescription>
          Performance metrics and efficiency insights
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {metric.badge}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Efficiency Metrics */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Efficiency Scores
          </h4>

          {/* Cache Efficiency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cache Efficiency</span>
              <span className="font-medium">{(cacheHitRate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={cacheHitRate * 100} className="h-2" />
          </div>

          {/* Query Efficiency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Query Efficiency</span>
              <span className="font-medium">{(queryEfficiency * 100).toFixed(1)}%</span>
            </div>
            <Progress value={queryEfficiency * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Findings per query: {totalQueries > 0 ? (totalFindings / totalQueries).toFixed(1) : 0}
            </p>
          </div>

          {/* Source Diversity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Source Diversity
              </span>
              <span className="font-medium">{(sourceDiversity * 100).toFixed(1)}%</span>
            </div>
            <Progress value={sourceDiversity * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Variety of sources and concepts explored
            </p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
            <BarChart3 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Performance Summary</p>
              <p className="text-xs text-muted-foreground">
                Completed {iterationsCompleted} research iterations in {formatDuration(durationSeconds)},
                collecting {totalFindings} findings from {totalSearches} searches with a{" "}
                {(cacheHitRate * 100).toFixed(0)}% cache hit rate.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
