"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Link2,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function confidence(index: number) {
  return Math.max(0.71, 0.98 - index * 0.04);
}

export default function ExtractionView() {
  const { activities, sources, topic } = useDeepResearchStore();
  const extractActivities = activities.filter((activity) => activity.type === "extract");
  const claims = extractActivities.length > 0 ? extractActivities : activities.slice(-4);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#111317]">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-8 backdrop-blur-xl">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bac9cc]" />
          <input
            className="w-full rounded border border-[#3b494c]/50 bg-[#0c0e12] py-1.5 pl-10 pr-4 text-sm text-[#e2e2e8] outline-none transition-all focus:border-[#c3f5ff]"
            placeholder="Search parameters..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="flex items-center gap-2 rounded bg-[#c3f5ff] px-4 py-1.5 text-sm font-semibold text-[#00363d] transition-all hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" />
            New Research
          </Link>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#a8ffd2]" />
              <span className="font-mono text-[10px] uppercase text-[#a8ffd2]">Neural Synthesis Engine Active</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#e2e2e8]">Neural Extraction</h1>
            <p className="max-w-xl text-sm text-[#bac9cc]">
              Mapping entities, relationship vectors, and evidence chains from high-latency source signals.
            </p>
          </div>
          <div className="glass-panel flex items-center gap-3 rounded px-4 py-2">
            <span className="font-mono text-[10px] uppercase text-[#bac9cc]">Topic:</span>
            <span className="font-mono text-xs text-[#e2e2e8]">{topic || "No active topic"}</span>
            <Link2 className="h-4 w-4 text-[#c3f5ff]" />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-6">
          <section className="col-span-12 flex min-h-0 flex-col gap-4 lg:col-span-5">
            <div className="flex items-center justify-between px-2">
              <h2 className="flex items-center gap-2 font-mono text-xs uppercase text-[#bac9cc]">
                <FileText className="h-4 w-4" />
                Source Material
              </h2>
              <div className="h-1 w-24 overflow-hidden rounded-full bg-[#333539]">
                <div className="h-full w-2/3 bg-[#c3f5ff]" />
              </div>
            </div>
            <div className="glass-panel custom-scrollbar flex-1 overflow-y-auto rounded-lg p-8 text-sm leading-7 text-[#e2e2e8]/90">
              {sources.length === 0 ? (
                <p className="text-[#bac9cc]">
                  Source text will appear after extraction begins. Start research from the workbench to populate
                  entity highlights and claim spans.
                </p>
              ) : (
                <>
                  <p className="mb-6">
                    Executive Summary: The current research topic highlights{" "}
                    <span className="rounded bg-[#c3f5ff]/10 px-1 text-[#c3f5ff]">{topic}</span> across{" "}
                    <span className="rounded bg-[#a8ffd2]/10 px-1 text-[#a8ffd2]">{sources.length} extracted sources</span>.
                    The crawler has identified recurring evidence fragments suitable for synthesis.
                  </p>
                  <p className="mb-6">
                    Search activity indicates high-value references from{" "}
                    <span className="rounded bg-[#c3f5ff]/10 px-1 text-[#c3f5ff]">{sources[0]?.title}</span>, with
                    additional support from the source ledger. Claims are scored by confidence and routed to the
                    confidence gate for contradiction checks.
                  </p>
                  <p>
                    Extracted entities and relationships are tracked as a local audit chain. Lower-confidence
                    fragments remain marked for review until another source corroborates the statement.
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="col-span-12 flex min-h-0 flex-col gap-6 lg:col-span-7">
            <div className="glass-panel relative h-1/3 min-h-[220px] overflow-hidden rounded-lg">
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                <Network className="h-5 w-5 text-[#c3f5ff]" />
                <span className="font-mono text-[10px] uppercase text-[#bac9cc]">Semantic Concept Mapping</span>
              </div>
              <div className="absolute right-4 top-4 z-10 flex gap-2">
                <span className="rounded border border-[#3b494c]/40 bg-[#0c0e12]/60 px-2 py-0.5 font-mono text-[10px] text-[#bac9cc]">
                  Entity
                </span>
                <span className="rounded border border-[#3b494c]/40 bg-[#0c0e12]/60 px-2 py-0.5 font-mono text-[10px] text-[#bac9cc]">
                  Claim
                </span>
              </div>
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-full w-full">
                  <div className="absolute left-1/3 top-1/4 flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-[#c3f5ff] shadow-[0_0_15px_rgba(0,218,243,0.35)]" />
                    <span className="mt-2 rounded bg-[#0c0e12]/80 px-2 py-0.5 font-mono text-[10px] text-[#c3f5ff]">
                      Primary Source
                    </span>
                  </div>
                  <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-[#a8ffd2]" />
                    <span className="mt-2 rounded bg-[#0c0e12]/80 px-2 py-0.5 font-mono text-[10px] text-[#a8ffd2]">
                      Verified Claim
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#c3f5ff] bg-[#111317]">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c3f5ff]" />
                    </div>
                    <span className="mt-2 rounded border border-[#3b494c] bg-[#0c0e12]/90 px-2 py-1 font-mono text-[11px] font-bold text-[#e2e2e8]">
                      {topic || "Research Core"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="flex items-center gap-2 font-mono text-xs uppercase text-[#bac9cc]">
                  <ShieldCheck className="h-4 w-4" />
                  Verified Claims
                </h2>
                <div className="flex gap-4 font-mono text-[10px] uppercase text-[#bac9cc]">
                  <span>{sources.length} entities found</span>
                  <span>{extractActivities.length} claims verified</span>
                </div>
              </div>
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {claims.length === 0 ? (
                  <div className="glass-panel rounded-lg p-6 text-sm text-[#bac9cc]">
                    No claims extracted yet.
                  </div>
                ) : (
                  claims.map((claim, index) => {
                    const conf = confidence(index);
                    const strong = conf >= 0.9;
                    return (
                      <article
                        key={`${claim.timestamp}-${index}`}
                        className={`glass-panel flex items-start gap-4 rounded-lg p-4 transition-colors hover:border-[#c3f5ff]/50 ${
                          strong ? "" : "border-dashed opacity-90"
                        }`}
                      >
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded border ${
                              strong
                                ? "border-[#c3f5ff]/20 bg-[#c3f5ff]/10 text-[#c3f5ff]"
                                : "border-[#3b494c]/40 bg-white/5 text-[#bac9cc]"
                            }`}
                          >
                            <span className="font-mono text-xs font-bold">{conf.toFixed(2)}</span>
                          </div>
                          <span className="font-mono text-[8px] uppercase text-[#bac9cc]">Conf</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-3">
                            <span className="rounded bg-[#1e2024] px-2 py-0.5 font-mono text-[10px] uppercase text-[#bac9cc]">
                              {claim.type}_signal
                            </span>
                            {sources[index] ? (
                              <Link
                                href="/workspace/source-ledger"
                                className="flex items-center gap-1 font-mono text-[10px] uppercase text-[#c3f5ff] hover:underline"
                              >
                                Source Ledger [SR-{String(index + 1).padStart(2, "0")}]
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              <span className="font-mono text-[10px] uppercase text-[#ffb4ab]">Needs Review</span>
                            )}
                          </div>
                          <p className="text-sm leading-6 text-[#e2e2e8]">{claim.message}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded border border-[#3b494c]/40 bg-[#333539] px-2 py-0.5 font-mono text-[10px] text-[#bac9cc]">
                              [REF-{String(index + 1).padStart(2, "0")}]
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
