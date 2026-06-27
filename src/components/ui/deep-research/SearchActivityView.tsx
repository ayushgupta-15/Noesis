"use client";

import { useDeepResearchStore } from "@/store/deepResearch";
import { format } from "date-fns";
import {
  Filter,
  GitBranch,
  History,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
} from "lucide-react";

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "local";
  }
}

function compactMessage(message: string) {
  if (!message.includes("https://")) return message;
  const [before, rest] = message.split("https://");
  return `${before}${rest.split("/")[0]}`;
}

export default function SearchActivityView() {
  const { activities, sources } = useDeepResearchStore();
  const searchEvents = activities.filter((activity) =>
    ["planning", "search", "extract"].includes(activity.type)
  );
  const activeWorkers = searchEvents.filter((activity) => activity.status === "pending").length;
  const domains = sources.reduce<Record<string, number>>((acc, source) => {
    const domain = domainFromUrl(source.url);
    acc[domain] = (acc[domain] ?? 0) + 1;
    return acc;
  }, {});
  const workers: [string, string, number, string][] = [
    ["Worker-081", "Crawling", 65, "#c3f5ff"],
    ["Worker-022", "Parsing", 92, "#a8ffd2"],
    ["Worker-015", activeWorkers ? "Queued" : "Idle", activeWorkers ? 35 : 0, "#849396"],
  ];
  const metrics: [string, number, string][] = [
    ["Relevance", 78, "#c3f5ff"],
    ["Coverage", Math.min(92, sources.length * 8), "#a8ffd2"],
    ["Deduped", Math.min(66, activities.length * 2), "#bac9cc"],
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#3b494c]/30 bg-[#111317]/80 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-2xl font-bold text-[#c3f5ff]">Search Activity</h1>
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bac9cc]" />
            <input
              className="w-64 rounded border border-[#3b494c]/40 bg-[#1a1c20] py-1.5 pl-10 pr-4 text-sm text-[#e2e2e8] outline-none transition-all focus:border-[#c3f5ff]"
              placeholder="Filter research logs..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded p-2 text-[#bac9cc] transition-colors hover:bg-[#282a2e] hover:text-[#e2e2e8]">
            <Settings className="h-4 w-4" />
          </button>
          <div className="rounded border border-[#3b494c]/30 bg-[#1a1c20] px-3 py-1 font-mono text-[10px] uppercase text-[#c3f5ff]">
            {activeWorkers || 1} pipelines active
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-12 grid-rows-6 gap-6 overflow-hidden p-6">
        <section className="scanline col-span-12 row-span-2 flex flex-col overflow-hidden rounded-lg border border-[#3b494c]/40 bg-[#1a1c20]/80 p-4 backdrop-blur-xl lg:col-span-3 lg:row-span-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-mono text-xs uppercase text-[#c3f5ff]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#c3f5ff]" />
              Crawlers
            </h2>
            <span className="font-mono text-xs text-[#849396]">v1.2-beta</span>
          </div>
          <div className="custom-scrollbar space-y-4 overflow-y-auto pr-1">
            {workers.map(([worker, status, progress, color]) => (
              <div key={worker} className="rounded border border-[#3b494c]/40 bg-[#0c0e12] p-3">
                <div className="mb-2 flex items-start justify-between">
                  <span className="font-mono text-sm text-[#e2e2e8]">{worker}</span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase" style={{ color }}>
                    {status}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded bg-[#333539]">
                  <div className="h-full" style={{ width: `${progress}%`, backgroundColor: color as string }} />
                </div>
                <p className="mt-2 truncate font-mono text-[10px] text-[#bac9cc]">
                  {sources[0]?.url || "Awaiting queue..."}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t border-[#3b494c]/30 pt-6">
            <h3 className="mb-3 font-mono text-[10px] uppercase text-[#bac9cc]">Domain Ledger</h3>
            <div className="space-y-2">
              {Object.entries(domains).slice(0, 5).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between font-mono text-xs">
                  <span className="truncate text-[#bac9cc]">{domain}</span>
                  <span className="text-[#c3f5ff]">{count} reqs</span>
                </div>
              ))}
              {Object.keys(domains).length === 0 && (
                <p className="font-mono text-xs text-[#bac9cc]">No domains scanned yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="col-span-12 row-span-3 flex flex-col overflow-hidden rounded-lg border border-[#3b494c]/40 bg-[#0c0e12] lg:col-span-9 lg:row-span-4">
          <div className="flex items-center justify-between border-b border-[#3b494c]/40 bg-[#111317]/60 p-3">
            <div className="flex items-center gap-3">
              <Terminal className="h-4 w-4 text-[#c3f5ff]" />
              <h2 className="font-mono text-xs uppercase text-[#e2e2e8]">Live Search Logs</h2>
            </div>
            <div className="flex items-center gap-2 rounded border border-[#3b494c]/30 bg-[#1e2024] px-2 py-0.5">
              <span className="h-2 w-2 rounded-full bg-[#c3f5ff] shadow-[0_0_5px_#00e5ff]" />
              <span className="font-mono text-[10px] uppercase text-[#e2e2e8]">Streaming</span>
            </div>
          </div>
          <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-4 font-mono text-xs">
            {searchEvents.length === 0 ? (
              <p className="text-[#849396]">[--:--:--] SYSTEM: Awaiting research stream...</p>
            ) : (
              searchEvents.map((activity, index) => (
                <p
                  key={`${activity.timestamp}-${index}`}
                  className={
                    activity.status === "error"
                      ? "text-[#ffb4ab]"
                      : activity.status === "complete"
                        ? "text-[#a8ffd2]"
                        : "text-[#c3f5ff]"
                  }
                >
                  [{activity.timestamp ? format(activity.timestamp, "HH:mm:ss.SSS") : "--:--:--"}]{" "}
                  {activity.type.toUpperCase()}: {compactMessage(activity.message)}
                </p>
              ))
            )}
          </div>
        </section>

        <section className="col-span-12 row-span-1 flex flex-col rounded-lg border border-[#3b494c]/40 bg-[#1a1c20]/80 p-4 lg:col-span-6 lg:row-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase text-[#e2e2e8]">Knowledge Graph Ingress</h2>
            <div className="flex gap-2">
              <span className="rounded-full border border-[#3b494c]/40 px-2 py-0.5 font-mono text-[10px] text-[#bac9cc]">
                Nodes: {sources.length + activities.length}
              </span>
              <span className="rounded-full border border-[#3b494c]/40 px-2 py-0.5 font-mono text-[10px] text-[#bac9cc]">
                Links: {Math.max(0, sources.length * 3)}
              </span>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded border border-[#3b494c]/30 bg-[#0c0e12]">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#c3f5ff]/20" />
                <div className="animate-reverse-spin absolute inset-4 rounded-full border border-[#a8ffd2]/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Network className="h-10 w-10 text-[#c3f5ff]" />
                </div>
              </div>
              <p className="font-mono text-xs text-[#bac9cc]">Building relational source lattice...</p>
            </div>
          </div>
        </section>

        <section className="col-span-12 row-span-1 rounded-lg border border-[#3b494c]/40 bg-[#1a1c20]/80 p-4 lg:col-span-3 lg:row-span-2">
          <h2 className="mb-4 font-mono text-xs uppercase text-[#e2e2e8]">Discovery Metrics</h2>
          <div className="space-y-4">
            {metrics.map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between font-mono text-[10px] uppercase text-[#bac9cc]">
                  <span>{label}</span>
                  <span style={{ color }}>{value}%</span>
                </div>
                <div className="h-1 rounded bg-[#333539]">
                  <div className="h-full rounded" style={{ width: `${value}%`, backgroundColor: color as string }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded border border-[#3b494c]/20 bg-[#333539]/30 p-3">
            <ShieldCheck className="h-5 w-5 text-[#a8ffd2]" />
            <div>
              <p className="text-[10px] font-bold uppercase text-[#e2e2e8]">Security Status</p>
              <p className="mt-1 text-[9px] uppercase text-[#a8ffd2]">Vetting Verified</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-[#3b494c]/30 bg-[#111317] px-8">
        <div className="flex gap-4">
          {[Filter, GitBranch, History].map((Icon, index) => (
            <button key={index} className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#bac9cc] hover:text-[#e2e2e8]">
              <Icon className="h-4 w-4" />
              {["Filters", "Topology", "Replay"][index]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px]">
          <span className="text-[#bac9cc]">LATENCY <span className="text-[#c3f5ff]">12ms</span></span>
          <span className="text-[#bac9cc]">API QUOTA <span className="text-[#e2e2e8]">8.2k / 10k</span></span>
        </div>
      </footer>
    </div>
  );
}
