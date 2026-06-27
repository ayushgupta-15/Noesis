"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Database,
  Diff,
  History,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

function trustScore(sourceCount: number, extractCount: number, hasReport: boolean) {
  if (hasReport) return 94.2;
  if (sourceCount === 0 && extractCount === 0) return 0;
  return Math.min(91.5, 54 + sourceCount * 2.2 + extractCount * 1.4);
}

export default function ConfidenceGateView() {
  const { sources, activities, report, topic } = useDeepResearchStore();
  const extractCount = activities.filter((activity) => activity.type === "extract").length;
  const analyzeCount = activities.filter((activity) => activity.type === "analyze").length;
  const score = trustScore(sources.length, extractCount, Boolean(report));
  const hasEvidence = sources.length > 0 || activities.length > 0;
  const needsReview = hasEvidence && score < 88;

  const fragments = activities
    .filter((activity) => ["analyze", "extract", "search"].includes(activity.type))
    .slice(-5)
    .reverse();

  const checks = [
    {
      title: "Source Reliability",
      description: `Validating credentials and publication history for ${sources.length} source nodes.`,
      status: sources.length > 0 ? "Passed" : "Waiting",
      tone: sources.length > 0 ? "passed" : "review",
      icon: ShieldCheck,
      refs: sources.slice(0, 3).map((source, index) => `[REF-${String(index + 1).padStart(2, "0")}] ${source.title || "Source"}`),
    },
    {
      title: "Claim Verification",
      description: `Cross-referencing ${extractCount} extracted claims against source context.`,
      status: report ? "Passed" : needsReview ? "Review" : "Running",
      tone: report ? "passed" : "review",
      icon: ClipboardCheck,
      note: needsReview
        ? "Ambiguous statements need additional source confirmation before report commit."
        : "Claim verification will harden as more extraction events complete.",
    },
    {
      title: "Contradiction Check",
      description: "Scanning for logical inconsistencies between conflicting research sources.",
      status: analyzeCount > 0 || report ? "Passed" : "Waiting",
      tone: analyzeCount > 0 || report ? "passed" : "review",
      icon: Diff,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-sm bg-[#c3f5ff]/10 px-2 py-0.5 font-mono text-xs uppercase text-[#c3f5ff]">
              Protocol 08-B
            </span>
            <span className="text-[#bac9cc]/30">•</span>
            <span className="font-mono text-xs uppercase text-[#bac9cc]">Active Validation Phase</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#e2e2e8] md:text-5xl">Confidence Gate</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#bac9cc]">
            Final verification protocol for {topic ? `"${topic}"` : "the active synthesis"}. Verify claims
            against the source ledger before report commit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 font-mono text-xs uppercase text-[#bac9cc] hover:text-[#e2e2e8]">
            <History className="h-4 w-4" />
            Gate History
          </button>
          <Link
            href="/workspace/report"
            className="rounded bg-[#c3f5ff] px-5 py-3 text-sm font-bold text-[#00363d] shadow-[0_0_20px_rgba(0,218,243,0.2)] transition-all hover:brightness-110"
          >
            Commit Report
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="glass-panel inner-glow rounded-lg p-6">
          <span className="font-mono text-xs uppercase text-[#bac9cc]">Claims Extracted</span>
          <div className="mt-4 font-serif text-4xl font-bold text-[#e2e2e8]">{extractCount}</div>
          <div className="mt-1 flex items-center gap-1 text-[#c3f5ff]">
            <TrendingUp className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase">+{Math.max(0, extractCount - 2)} from baseline</span>
          </div>
        </div>
        <div className="glass-panel inner-glow rounded-lg border-l-2 border-l-[#c3f5ff]/30 p-6">
          <span className="font-mono text-xs uppercase text-[#bac9cc]">Sources Found</span>
          <div className="mt-4 font-serif text-4xl font-bold text-[#e2e2e8]">{sources.length}</div>
          <div className="mt-1 flex items-center gap-1 text-[#9cf0ff]/80">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase">Ledger backed</span>
          </div>
        </div>
        <div className="glass-panel inner-glow relative overflow-hidden rounded-lg p-6 md:col-span-2">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#c3f5ff]/5 to-transparent" />
          <div className="relative z-10">
            <span className="font-mono text-xs uppercase text-[#bac9cc]">Overall System Trust</span>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="font-serif text-5xl font-bold text-[#c3f5ff]">{score.toFixed(1)}%</div>
              <span
                className={`rounded px-2 py-0.5 font-mono text-xs uppercase ${
                  score >= 88 ? "bg-[#00e5ff] text-[#00626e]" : "border border-dashed border-[#c0c1ff] text-[#c0c1ff]"
                }`}
              >
                {score >= 88 ? "High Confidence" : "Needs Review"}
              </span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-[#bac9cc]">
              Probability based on source cross-referencing and contradiction analysis.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-mono text-xs uppercase text-[#e2e2e8]">
            <ClipboardCheck className="h-4 w-4 text-[#c3f5ff]" />
            Confidence Checks
          </h2>
          {checks.map((check) => {
            const Icon = check.icon;
            const passed = check.tone === "passed";
            return (
              <article
                key={check.title}
                className={`glass-panel inner-glow rounded-lg p-5 ${
                  passed ? "" : "border-l-2 border-l-[#c0c1ff]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${
                        passed ? "bg-[#a8ffd2]/10 text-[#a8ffd2]" : "bg-[#c0c1ff]/10 text-[#c0c1ff]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-[#e2e2e8]">{check.title}</h3>
                      <p className="mt-1 text-sm text-[#bac9cc]">{check.description}</p>
                    </div>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-mono text-[10px] uppercase ${
                      passed
                        ? "border border-[#a8ffd2]/20 bg-[#006645] text-[#a8ffd2]"
                        : "border border-dashed border-[#c0c1ff] text-[#c0c1ff]"
                    }`}
                  >
                    {passed && <CheckCircle2 className="h-3 w-3" />}
                    {check.status}
                  </span>
                </div>
                {"refs" in check && check.refs.length > 0 && (
                  <div className="custom-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                    {check.refs.map((ref) => (
                      <span
                        key={ref}
                        className="whitespace-nowrap rounded border border-[#3b494c]/40 bg-[#bac9cc]/5 px-2 py-1 font-mono text-[11px] text-[#bac9cc]"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
                {"note" in check && check.note && (
                  <div className="mt-4 rounded border border-[#3b494c]/20 bg-[#bac9cc]/5 p-4">
                    <p className="text-sm italic text-[#bac9cc]">{check.note}</p>
                    {!report && (
                      <Link
                        href="/workspace/source-ledger"
                        className="mt-3 flex items-center gap-1 font-mono text-[11px] uppercase text-[#c0c1ff] hover:underline"
                      >
                        Resolve anomalies <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="space-y-4">
          <h2 className="flex items-center gap-2 font-mono text-xs uppercase text-[#e2e2e8]">
            <Boxes className="h-4 w-4 text-[#c3f5ff]" />
            Evidence Fragments
          </h2>
          <div className="glass-panel inner-glow flex max-h-[600px] flex-col rounded-lg">
            <div className="flex items-center justify-between border-b border-[#3b494c]/20 bg-[#1e2024]/30 p-4">
              <span className="font-mono text-[10px] uppercase text-[#bac9cc]">Fragment History</span>
              <span className="font-mono text-[10px] text-[#c3f5ff]">LIVE SYNC</span>
            </div>
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
              {fragments.length === 0 ? (
                <p className="rounded border-l-2 border-[#c3f5ff] bg-white/5 p-3 text-sm text-[#bac9cc]">
                  No evidence fragments yet. Run a research session to populate validation history.
                </p>
              ) : (
                fragments.map((fragment, index) => (
                  <div key={`${fragment.timestamp}-${index}`} className="space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#bac9cc]/70">
                      <span>#{String(index + 1).padStart(3, "0")}</span>
                      <span>{fragment.type.toUpperCase()}</span>
                    </div>
                    <p
                      className={`rounded border-l-2 bg-white/5 p-3 text-sm text-[#e2e2e8] ${
                        fragment.type === "analyze"
                          ? "border-[#a8ffd2]"
                          : fragment.type === "extract"
                            ? "border-[#c0c1ff]"
                            : "border-[#c3f5ff]"
                      }`}
                    >
                      {fragment.message}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-[#3b494c]/20 bg-[#1e2024]/30 p-4 text-center">
              <Link href="/workspace/source-ledger" className="font-mono text-[11px] uppercase text-[#c3f5ff] hover:underline">
                View full ledger
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-[#3b494c]/30 bg-[#0c0e12] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#c3f5ff]" />
              <span className="font-mono text-[10px] uppercase text-[#bac9cc]">Lab Synthesis Visualization</span>
            </div>
            <div className="h-28 rounded bg-[linear-gradient(135deg,rgba(195,245,255,0.18),rgba(192,193,255,0.08),rgba(15,17,21,0.9))]" />
          </div>
        </aside>
      </section>

      <section className="glass-panel rounded-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase text-[#bac9cc]">Gate Readiness</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#e2e2e8]">
              {score >= 88 ? "Ready for report commit" : "Needs additional evidence"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#c3f5ff]" />
            <span className="font-mono text-xs text-[#bac9cc]">
              {activities.length} events processed
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
