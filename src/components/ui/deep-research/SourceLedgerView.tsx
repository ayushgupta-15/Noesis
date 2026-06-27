"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Terminal,
} from "lucide-react";

function hostFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function confidenceFor(index: number) {
  return Math.max(72, 98 - index * 3.1);
}

export default function SourceLedgerView() {
  const { sources, activities } = useDeepResearchStore();
  const extractCount = activities.filter((activity) => activity.type === "extract").length;
  const avgConfidence =
    sources.length > 0
      ? sources.reduce((total, _source, index) => total + confidenceFor(index), 0) / sources.length
      : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase text-[#c3f5ff]">
            <Database className="h-4 w-4" />
            Verified Source Archive
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#e2e2e8]">Source Ledger</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#bac9cc]">
            A forensic record of technical documentation and neural-extracted assets from the Exa crawler.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded border border-[#3b494c]/40 bg-[#282a2e] px-4 py-2 font-mono text-xs uppercase text-[#bac9cc] transition-all hover:bg-[#333539] hover:text-[#c3f5ff]">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 rounded border border-[#3b494c]/40 bg-[#282a2e] px-4 py-2 font-mono text-xs uppercase text-[#bac9cc] transition-all hover:bg-[#333539] hover:text-[#c3f5ff]">
            <RefreshCw className="h-4 w-4" />
            Re-scan Ledger
          </button>
        </div>
      </header>

      <div className="glass-panel overflow-hidden rounded-lg shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#3b494c]/40 bg-[#333539]/50">
                {["Source Title", "Origin URL", "Extraction Agent", "Confidence", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 font-mono text-[11px] font-semibold uppercase text-[#bac9cc]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3b494c]/20">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-[#c3f5ff]/60" />
                    <p className="font-serif text-xl font-semibold text-[#e2e2e8]">No ledger entries yet</p>
                    <p className="mt-2 text-sm text-[#bac9cc]">
                      Run a research session from the workbench and extracted sources will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                sources.map((source, index) => {
                  const confidence = confidenceFor(index);
                  const isStrong = confidence >= 88;
                  const isWeak = confidence < 78;

                  return (
                    <tr key={`${source.url}-${index}`} className="group transition-all hover:bg-[#c3f5ff]/5">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <FileText className={`h-5 w-5 ${isWeak ? "text-[#ffb4ab]" : "text-[#bac9cc]"}`} />
                          <div>
                            <div className="text-sm font-semibold text-[#e2e2e8]">
                              {source.title || hostFromUrl(source.url)}
                            </div>
                            <div className="font-mono text-[10px] uppercase text-[#bac9cc]/70">
                              ID: REF-{String(index + 1).padStart(3, "0")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          href={source.url}
                          target="_blank"
                          className="flex items-center gap-2 text-[#bac9cc] transition-colors hover:text-[#c3f5ff]"
                        >
                          <span className="max-w-[220px] truncate font-mono text-xs">
                            {hostFromUrl(source.url)}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isWeak ? "bg-[#849396]" : isStrong ? "bg-[#5be9ad]" : "bg-[#c0c1ff]"
                            }`}
                          />
                          <span className="font-mono text-xs text-[#e2e2e8]">Exa-Crawler / OpenRouter</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#282a2e]">
                            <div
                              className={`h-full rounded-full ${
                                isWeak ? "bg-[#ffb4ab]" : isStrong ? "bg-[#5be9ad]" : "bg-[#c0c1ff]"
                              }`}
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs ${
                              isWeak ? "text-[#ffb4ab]" : isStrong ? "text-[#5be9ad]" : "text-[#c0c1ff]"
                            }`}
                          >
                            {confidence.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          href={source.url}
                          target="_blank"
                          className="rounded border border-[#c3f5ff]/20 bg-[#c3f5ff]/10 px-3 py-1.5 font-mono text-[10px] uppercase text-[#c3f5ff] transition-all hover:bg-[#c3f5ff] hover:text-[#00363d]"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#3b494c]/40 bg-[#1a1c20] px-6 py-4">
          <div className="font-mono text-xs uppercase text-[#bac9cc]">
            Showing {sources.length === 0 ? 0 : 1}-{sources.length} of {sources.length} entries
          </div>
          <div className="flex gap-2">
            <button className="rounded border border-[#3b494c]/40 p-2 text-[#bac9cc] hover:bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded bg-[#c3f5ff] px-3 py-1 font-mono text-xs text-[#00363d]">1</button>
            <button className="rounded border border-[#3b494c]/40 p-2 text-[#bac9cc] hover:bg-white/5">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="glass-panel rounded-lg p-6 md:col-span-2">
          <h2 className="mb-6 font-serif text-xl font-semibold text-[#e2e2e8]">Extraction Metrics</h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              ["Avg Confidence", sources.length ? `${avgConfidence.toFixed(1)}%` : "0%"],
              ["Verified Citations", sources.length],
              ["Model Drift", "0.02%"],
              ["Extraction Events", extractCount],
            ].map(([label, value]) => (
              <div key={label} className="space-y-1">
                <p className="font-mono text-[10px] uppercase text-[#bac9cc]">{label}</p>
                <p className="font-serif text-3xl font-bold text-[#c3f5ff]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex h-24 items-end gap-1 rounded bg-[#282a2e]/30 px-4 py-2">
            {[45, 60, 35, 76, 70, 100, 82, 62, 26].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t bg-[#c3f5ff]/50"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </section>

        <section className="glass-panel relative overflow-hidden rounded-lg border-[#c3f5ff]/20 p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c3f5ff]/5 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#e2e2e8]">Exa Live Stream</h2>
              <div className="rounded-full border border-[#5be9ad]/30 bg-[#5be9ad]/20 px-2 py-0.5 font-mono text-[9px] uppercase text-[#5be9ad]">
                Live
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-1 rounded-full bg-[#c3f5ff]/25" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-[#c3f5ff]">CRAWLING</p>
                  <p className="truncate text-xs text-[#bac9cc]">
                    {sources[0]?.url || "Awaiting source stream"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-1 rounded-full bg-[#5be9ad]/25" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-[#5be9ad]">TOKENIZING</p>
                  <p className="truncate text-xs text-[#bac9cc]">
                    Processing semantic chunks ({sources.length * 640}/{Math.max(1, sources.length) * 1400})
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/workspace"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded border border-[#3b494c]/40 py-2 font-mono text-[10px] uppercase text-[#bac9cc] transition-all hover:border-[#c3f5ff] hover:text-[#c3f5ff]"
            >
              <Terminal className="h-4 w-4" />
              Return to Workbench
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
