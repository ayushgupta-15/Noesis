"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import Link from "next/link";
import {
  BadgeCheck,
  CircleDashed,
  FileText,
  Microscope,
  Search,
  Sparkles,
} from "lucide-react";

const stages = [
  { type: "planning", label: "Plan", icon: CircleDashed, href: "/workspace#research-plan" },
  { type: "search", label: "Search", icon: Search, href: "/workspace/search-activity" },
  { type: "extract", label: "Extract", icon: Microscope, href: "/workspace/extraction" },
  { type: "analyze", label: "Gate", icon: BadgeCheck, href: "/workspace/confidence-gate" },
  { type: "generate", label: "Report", icon: FileText, href: "/workspace/report" },
] as const;

const ResearchActivities = () => {
  const { activities, sources, report } = useDeepResearchStore();

  const activeStage =
    [...activities].reverse().find((activity) => activity.status === "pending")
      ?.type ?? null;

  const completedStageTypes = new Set(
    activities
      .filter((activity) => activity.status === "complete")
      .map((activity) => activity.type)
  );

  const errorStageTypes = new Set(
    activities
      .filter((activity) => activity.status === "error")
      .map((activity) => activity.type)
  );

  if (activities.length === 0) {
    return (
      <section id="pipeline-rail" className="glass-panel scroll-mt-20 rounded-lg p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-[#00daf3]" />
          Pipeline Rail
        </div>
        <p className="mt-2 text-sm text-[#bac9cc]">
          The live audit trail appears here once research starts.
        </p>
      </section>
    );
  }

  return (
    <section id="pipeline-rail" className="scroll-mt-20 overflow-hidden rounded-lg border border-[#3b494c]/40 bg-[#0c0e12] text-white shadow-sm">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-white/45">
              Pipeline Rail
            </p>
            <h2 className="mt-1 text-lg font-semibold">Live research instrument</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/70">
              {activities.length} events
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/70">
              {sources.length} sources
            </span>
            <span className={`rounded px-2 py-1 ${report ? "bg-[#5be9ad] text-[#003824]" : "bg-[#00daf3] text-[#00363d]"}`}>
              {report ? "complete" : "running"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="relative grid grid-cols-5 gap-2">
          <div className="absolute left-[10%] right-[10%] top-5 h-px bg-white/15 sm:top-6" />
          <div className="absolute left-[10%] top-5 h-px bg-[#00daf3] transition-all duration-500 sm:top-6" style={{
            width: `${Math.max(
              0,
              stages.findIndex((stage) => stage.type === activeStage) >= 0
                ? stages.findIndex((stage) => stage.type === activeStage) * 20
                : completedStageTypes.size * 20
            )}%`,
          }} />

          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.type;
            const isComplete = completedStageTypes.has(stage.type);
            const hasError = errorStageTypes.has(stage.type);

            return (
              <Link
                key={stage.type}
                href={stage.href}
                className="relative flex flex-col items-center gap-2 rounded p-1 text-center transition hover:bg-white/5"
              >
                <span
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all sm:h-12 sm:w-12 ${
                    hasError
                      ? "border-red-400 bg-red-500/15 text-red-200"
                      : isActive
                        ? "pipeline-node-active border-[#00daf3] bg-[#00daf3] text-[#00363d]"
                        : isComplete
                          ? "border-[#5be9ad] bg-[#5be9ad] text-[#003824]"
                          : "border-white/15 bg-[#171B24] text-white/45"
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div>
                  <p className="text-xs font-medium sm:text-sm">{stage.label}</p>
                  <p className="text-xs text-white/45">
                    {activities.filter((activity) => activity.type === stage.type).length} events
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 p-5">
        <p className="text-sm text-white/45">
          Detailed search logs and extraction evidence are available in their dedicated audit pages.
        </p>
        <div className="flex gap-2">
          <Link
            href="/workspace/search-activity"
            className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#c3f5ff] hover:bg-white/[0.06]"
          >
            Search Activity
          </Link>
          <Link
            href="/workspace/extraction"
            className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-[#c3f5ff] hover:bg-white/[0.06]"
          >
            Extraction
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResearchActivities;
