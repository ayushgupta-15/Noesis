"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import type { Activity } from "@/app/api/deep-research/types";
import { format } from "date-fns";
import { CloudCog, Rss, Search, Sparkles } from "lucide-react";

function isSearchLike(activity: Activity) {
  return ["planning", "search", "extract"].includes(activity.type);
}

function compactMessage(message: string) {
  if (!message.includes("https://")) return message;
  const [before, rest] = message.split("https://");
  return `${before}${rest.split("/")[0]}`;
}

export default function WorkbenchSearchRail() {
  const { activities, sources, report } = useDeepResearchStore();
  const searchActivities = activities.filter(isSearchLike).slice(-8).reverse();
  const confidenceScore = report ? 88 : activities.length > 0 ? 64 : 0;

  return (
    <aside className="hidden h-full w-[380px] shrink-0 flex-col overflow-hidden border-l border-[#3b494c]/30 bg-[#1a1c20]/40 xl:flex">
      <div className="border-b border-[#3b494c]/30 p-6 pb-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-lg text-[#e2e2e8]">Search Activity</h2>
          <Rss className="h-5 w-5 text-[#c3f5ff]" />
        </div>
        <div className="flex items-center gap-2 rounded border border-[#3b494c]/40 bg-[#0c0e12] px-2 py-1">
          <span className="font-mono text-[10px] text-[#bac9cc]">ENGINE:</span>
          <span className="font-mono text-[10px] font-bold text-[#c3f5ff]">
            EXA.AI (NEURAL SEARCH)
          </span>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
        {searchActivities.length === 0 ? (
          <div className="rounded border border-[#3b494c]/30 bg-[#1e2024]/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-[#c3f5ff]" />
              <p className="font-mono text-xs text-[#c3f5ff]">Awaiting research query</p>
            </div>
            <p className="text-xs leading-5 text-[#bac9cc]">
              Search events, extracted sources, and confidence context will appear here during a run.
            </p>
          </div>
        ) : (
          searchActivities.map((activity, index) => (
            <div key={`${activity.timestamp}-${index}`} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#bac9cc]">
                  {activity.timestamp ? format(activity.timestamp, "HH:mm:ss") : "--:--:--"}
                </span>
                <div className="h-px flex-1 bg-[#3b494c]/40" />
              </div>
              <div
                className={`rounded border p-3 transition-colors ${
                  activity.status === "pending"
                    ? "animate-pulse border-[#c3f5ff]/30 bg-[#c3f5ff]/5"
                    : "border-[#3b494c]/30 bg-[#1e2024]/50 hover:border-[#c3f5ff]/40"
                }`}
              >
                <div className="mb-2 flex items-start gap-2">
                  {activity.status === "pending" ? (
                    <CloudCog className="mt-0.5 h-4 w-4 shrink-0 text-[#c3f5ff]" />
                  ) : (
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#c3f5ff]" />
                  )}
                  <p className="font-mono text-xs leading-5 text-[#c3f5ff]">
                    {activity.type.toUpperCase()}: {compactMessage(activity.message)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#3b494c]/30 bg-[#333539] p-5">
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase text-[#e2e2e8]">
          Quick Context
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Sources Scanned", sources.length],
            ["Conf. Score", `${confidenceScore}%`],
            ["Extracted Claims", activities.filter((activity) => activity.type === "extract").length],
            ["Tokens Used", `${Math.max(0.4, activities.length * 0.12).toFixed(1)}k`],
          ].map(([label, value]) => (
            <div key={label} className="rounded border border-[#3b494c]/20 bg-[#0c0e12]/45 p-3">
              <p className="mb-1 text-[9px] uppercase text-[#bac9cc]">{label}</p>
              <p className="font-serif text-2xl font-semibold text-[#c3f5ff]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
