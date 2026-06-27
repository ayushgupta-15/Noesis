"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import { AudioLines } from "lucide-react";

export default function WorkbenchStatus() {
  const { topic, activities, report } = useDeepResearchStore();
  const statusText =
    activities.length > 0
      ? `Researching topic "${topic || "Active session"}"`
      : topic
        ? `Briefing topic "${topic}"`
        : "Local-first audit workspace ready";

  return (
    <div className="hidden max-w-2xl flex-1 px-8 lg:block">
      <div className="flex h-10 items-center gap-3 rounded-full border border-[#3b494c]/30 bg-[#1a1c20] px-4">
        <AudioLines className="h-4 w-4 text-[#c3f5ff]" />
        <span className="font-mono text-[10px] font-semibold uppercase text-[#c3f5ff]/70">
          Status:
        </span>
        <span className="truncate text-sm text-[#e2e2e8]">{statusText}</span>
        <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[#c3f5ff] shadow-[0_0_12px_rgba(0,218,243,0.7)]" />
        <span className="border-l border-[#3b494c]/40 pl-4 font-mono text-[10px] font-semibold uppercase text-[#bac9cc]">
          {report ? "Report Ready" : "OpenRouter"}
        </span>
      </div>
    </div>
  );
}
